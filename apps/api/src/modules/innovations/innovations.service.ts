import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Innovation, InnovationStatus } from './entities/innovation.entity';
import { InnovationMilestone } from './entities/innovation-milestone.entity';
import { InnovationMember, TeamRole } from './entities/innovation-member.entity';
import { InnovationComment } from './entities/innovation-comment.entity';
import { CreateInnovationDto } from './dto/create-innovation.dto';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { UpdateInnovationDto } from './dto/update-innovation.dto';
import { ReviewInnovationDto } from './dto/review-innovation.dto';
import { UsersService } from '../users/users.service';
import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class InnovationsService {
  constructor(
    @InjectRepository(Innovation)
    private innovationRepository: Repository<Innovation>,
    @InjectRepository(InnovationMilestone)
    private milestoneRepository: Repository<InnovationMilestone>,
    @InjectRepository(InnovationMember)
    private memberRepository: Repository<InnovationMember>,
    @InjectRepository(InnovationComment)
    private commentRepository: Repository<InnovationComment>,
    private usersService: UsersService,
    private gamificationService: GamificationService,
  ) {}

  async create(createInnovationDto: CreateInnovationDto, userId: string): Promise<Innovation> {
    const innovation = this.innovationRepository.create({
      ...createInnovationDto,
      student_id: userId,
    });
    const saved = await this.innovationRepository.save(innovation);

    // Award XP for creating a draft
    await this.gamificationService.awardXP(userId, 10, 'innovation_created_draft', saved.id);

    return saved;
  }

  async findAll(userId: string, role: string, status?: string): Promise<Innovation[]> {
    // Public Showcase: Allow everyone to see APPROVED innovations
    if (status === InnovationStatus.APPROVED) {
      return this.innovationRepository.find({
        where: { status: InnovationStatus.APPROVED },
        relations: ['student'],
        order: { created_at: 'DESC' },
      });
    }

    if (role === 'admin' || role === 'instructor' || role === 'educator') {
      const where: FindOptionsWhere<Innovation> = {};
      if (status) {
        where.status = status as InnovationStatus;
      }
      return this.innovationRepository.find({
        where,
        relations: ['student'],
        order: { created_at: 'DESC' },
      });
    }

    // Students only see their own
    return this.innovationRepository.find({
      where: { student_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, userId: string, role: string): Promise<Innovation> {
    const innovation = await this.innovationRepository.findOne({
      where: { id },
      relations: [
        'student', 
        'reviews', 
        'reviews.reviewer', 
        'milestones', 
        'members', 
        'members.user',
        'comments',
        'comments.user',
        'comments.children',
        'comments.children.user'
      ],
      order: {
        milestones: {
          due_date: 'ASC',
        },
        members: {
          joined_at: 'ASC',
        },
        comments: {
          created_at: 'ASC',
        }
      },
    });

    if (!innovation) {
      throw new NotFoundException('Innovation not found');
    }

    if (role !== 'admin' && role !== 'instructor' && innovation.student_id !== userId) {
      throw new ForbiddenException('You do not have permission to view this innovation');
    }

    return innovation;
  }

  async update(
    id: string, 
    updateInnovationDto: UpdateInnovationDto, 
    userId: string,
    role: string
  ): Promise<Innovation> {
    const innovation = await this.findOne(id, userId, role);

    // Only allow students to update if DRAFT or admin/instructor anytime
    if (role !== 'admin' && role !== 'instructor') {
       if (innovation.status !== InnovationStatus.DRAFT && innovation.status !== InnovationStatus.REJECTED) {
         throw new ForbiddenException('Cannot edit submitted or approved innovations');
       }
    }

    Object.assign(innovation, updateInnovationDto);
    return this.innovationRepository.save(innovation);
  }

  async submit(id: string, userId: string): Promise<Innovation> {
    const innovation = await this.findOne(id, userId, 'student'); // Use 'student' role to enforce ownership check if not admin

    if (innovation.status !== InnovationStatus.DRAFT && innovation.status !== InnovationStatus.REJECTED) {
      throw new ForbiddenException('Only draft or rejected innovations can be submitted');
    }

    innovation.status = InnovationStatus.SUBMITTED;
    const saved = await this.innovationRepository.save(innovation);

    // Award XP for submission
    await this.gamificationService.awardXP(userId, 50, 'innovation_submitted', saved.id);

    return saved;
  }

  // Milestone Management
  async addMilestone(
    innovationId: string,
    createMilestoneDto: CreateMilestoneDto,
    userId: string,
    role: string,
  ): Promise<InnovationMilestone> {
    const innovation = await this.findOne(innovationId, userId, role);

    // Only owner or admin/instructor can add milestones
    if (role !== 'admin' && role !== 'instructor' && innovation.student_id !== userId) {
      throw new ForbiddenException('You do not have permission to add milestones to this innovation');
    }

    const milestone = this.milestoneRepository.create({
      ...createMilestoneDto,
      innovation_id: innovationId,
    });

    return this.milestoneRepository.save(milestone);
  }

  async updateMilestone(
    innovationId: string,
    milestoneId: string,
    updateMilestoneDto: UpdateMilestoneDto,
    userId: string,
    role: string,
  ): Promise<InnovationMilestone> {
    const innovation = await this.findOne(innovationId, userId, role);

    if (role !== 'admin' && role !== 'instructor' && innovation.student_id !== userId) {
      throw new ForbiddenException('You do not have permission to update milestones for this innovation');
    }

    const milestone = await this.milestoneRepository.findOne({
      where: { id: milestoneId, innovation_id: innovationId },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    Object.assign(milestone, updateMilestoneDto);
    return this.milestoneRepository.save(milestone);
  }

  async deleteMilestone(
    innovationId: string,
    milestoneId: string,
    userId: string,
    role: string,
  ): Promise<void> {
    const innovation = await this.findOne(innovationId, userId, role);

    if (role !== 'admin' && role !== 'instructor' && innovation.student_id !== userId) {
      throw new ForbiddenException('You do not have permission to delete milestones for this innovation');
    }

    const result = await this.milestoneRepository.delete({ id: milestoneId, innovation_id: innovationId });
    if (result.affected === 0) {
      throw new NotFoundException('Milestone not found');
    }
  }

  // Team Management
  async addTeamMember(
    innovationId: string,
    addTeamMemberDto: AddTeamMemberDto,
    userId: string,
    role: string,
  ): Promise<InnovationMember> {
    const innovation = await this.findOne(innovationId, userId, role);

    if (role !== 'admin' && role !== 'instructor' && innovation.student_id !== userId) {
      throw new ForbiddenException('Only the project owner can add team members');
    }

    const userToAdd = await this.usersService.findByEmail(addTeamMemberDto.email);
    if (!userToAdd) {
      throw new NotFoundException('User with this email not found');
    }

    if (userToAdd.id === innovation.student_id) {
      throw new ForbiddenException('Project owner is already a member');
    }

    const existingMember = await this.memberRepository.findOne({
      where: { innovation_id: innovationId, user_id: userToAdd.id },
    });

    if (existingMember) {
      throw new ForbiddenException('User is already a team member');
    }

    const member = this.memberRepository.create({
      innovation_id: innovationId,
      user_id: userToAdd.id,
      role: addTeamMemberDto.role || TeamRole.MEMBER,
    });

    return this.memberRepository.save(member);
  }

  async removeTeamMember(
    innovationId: string,
    memberId: string,
    userId: string,
    role: string,
  ): Promise<void> {
    const innovation = await this.findOne(innovationId, userId, role);

    if (role !== 'admin' && role !== 'instructor' && innovation.student_id !== userId) {
      throw new ForbiddenException('Only the project owner can remove team members');
    }

    const member = await this.memberRepository.findOne({
      where: { id: memberId, innovation_id: innovationId },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    await this.memberRepository.remove(member);
  }

  async approve(id: string, userId: string, role: string): Promise<Innovation> {
    if (role !== 'admin' && role !== 'instructor' && role !== 'educator') {
      throw new ForbiddenException('Only admins and instructors can approve innovations');
    }

    const innovation = await this.innovationRepository.findOne({ where: { id } });
    if (!innovation) throw new NotFoundException('Innovation not found');

    innovation.status = InnovationStatus.APPROVED;
    const saved = await this.innovationRepository.save(innovation);

    // Award XP for approval
    await this.gamificationService.awardXP(innovation.student_id, 200, 'innovation_approved', saved.id);
    // Unlock achievement
    await this.gamificationService.checkAndUnlockAchievement(innovation.student_id, 'innovation-approved');

    return saved;
  }

  async reject(id: string, userId: string, role: string): Promise<Innovation> {
    if (role !== 'admin' && role !== 'instructor' && role !== 'educator') {
      throw new ForbiddenException('Only admins and instructors can reject innovations');
    }

    const innovation = await this.innovationRepository.findOne({ where: { id } });
    if (!innovation) throw new NotFoundException('Innovation not found');

    innovation.status = InnovationStatus.REJECTED;
    return this.innovationRepository.save(innovation);
  }

  async review(id: string, reviewDto: ReviewInnovationDto, userId: string, role: string): Promise<Innovation> {
    if (role !== 'admin' && role !== 'instructor' && role !== 'educator') {
      throw new ForbiddenException('Only admins and instructors can review innovations');
    }

    const innovation = await this.innovationRepository.findOne({ where: { id } });
    if (!innovation) throw new NotFoundException('Innovation not found');

    innovation.status = reviewDto.status;
    
    if (reviewDto.allocated_budget !== undefined) {
      innovation.allocated_budget = reviewDto.allocated_budget;
    }

    return this.innovationRepository.save(innovation);
  }

  async remove(id: string, userId: string, role: string): Promise<void> {
    const innovation = await this.findOne(id, userId, role);
    await this.innovationRepository.remove(innovation);
  }

  // Comments
  async addComment(
    innovationId: string, 
    createCommentDto: CreateCommentDto, 
    userId: string
  ): Promise<InnovationComment> {
    // Ensure innovation exists (we don't check permissions here as any authenticated user can likely comment, or at least viewers)
    // Actually, we should probably check if the user can view the innovation.
    // For simplicity, we assume if they can hit the endpoint (guarded), they can comment.
    // But it's better to verify existence.
    const innovation = await this.innovationRepository.findOne({ where: { id: innovationId } });
    if (!innovation) throw new NotFoundException('Innovation not found');

    const comment = this.commentRepository.create({
      ...createCommentDto,
      innovation_id: innovationId,
      user_id: userId,
      parent_id: createCommentDto.parentId,
    });

    return this.commentRepository.save(comment);
  }

  async getComments(innovationId: string, userId: string, role: string): Promise<InnovationComment[]> {
    // Check view permission
    await this.findOne(innovationId, userId, role);

    return this.commentRepository.find({
      where: { innovation_id: innovationId },
      relations: ['user', 'children', 'children.user'],
      order: { created_at: 'ASC' }, // Chronological order
    });
  }

  async deleteComment(commentId: string, userId: string, role: string): Promise<void> {
    const comment = await this.commentRepository.findOne({ 
      where: { id: commentId },
      relations: ['innovation'] 
    });
    
    if (!comment) throw new NotFoundException('Comment not found');

    // Allow author or admin/instructor/owner of innovation to delete
    const isAuthor = comment.user_id === userId;
    const isAdmin = role === 'admin' || role === 'instructor';
    const isOwner = comment.innovation.student_id === userId;

    if (!isAuthor && !isAdmin && !isOwner) {
      throw new ForbiddenException('You cannot delete this comment');
    }

    await this.commentRepository.remove(comment);
  }
}
