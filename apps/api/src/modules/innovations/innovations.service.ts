import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Innovation, InnovationStatus } from './entities/innovation.entity';
import { CreateInnovationDto } from './dto/create-innovation.dto';
import { UpdateInnovationDto } from './dto/update-innovation.dto';
import { ReviewInnovationDto } from './dto/review-innovation.dto';

@Injectable()
export class InnovationsService {
  constructor(
    @InjectRepository(Innovation)
    private innovationRepository: Repository<Innovation>,
  ) {}

  async create(createInnovationDto: CreateInnovationDto, userId: string): Promise<Innovation> {
    const innovation = this.innovationRepository.create({
      ...createInnovationDto,
      student_id: userId,
    });
    return this.innovationRepository.save(innovation);
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
      const where: any = {};
      if (status) {
        where.status = status;
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
      relations: ['student', 'reviews', 'reviews.reviewer'],
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
    return this.innovationRepository.save(innovation);
  }

  async approve(id: string, userId: string, role: string): Promise<Innovation> {
    if (role !== 'admin' && role !== 'instructor' && role !== 'educator') {
      throw new ForbiddenException('Only admins and instructors can approve innovations');
    }

    const innovation = await this.innovationRepository.findOne({ where: { id } });
    if (!innovation) throw new NotFoundException('Innovation not found');

    innovation.status = InnovationStatus.APPROVED;
    return this.innovationRepository.save(innovation);
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
}
