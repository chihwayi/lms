import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MentorProfile } from './entities/mentor-profile.entity';
import { MentorshipRequest, MentorshipRequestStatus } from './entities/mentorship-request.entity';
import { MentorshipSession, SessionStatus } from './entities/mentorship-session.entity';
import { Innovation } from '../innovations/entities/innovation.entity';
import { CreateMentorProfileDto } from './dto/create-mentor-profile.dto';
import { UpdateMentorProfileDto } from './dto/update-mentor-profile.dto';
import { CreateSessionDto } from './dto/session.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { CreateMentorshipRequestDto } from './dto/create-mentorship-request.dto';
import { UpdateMentorshipRequestDto } from './dto/update-mentorship-request.dto';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MentorshipService {
  private readonly logger = new Logger(MentorshipService.name);

  constructor(
    @InjectRepository(MentorProfile)
    private mentorProfileRepository: Repository<MentorProfile>,
    @InjectRepository(MentorshipRequest)
    private mentorshipRequestRepository: Repository<MentorshipRequest>,
    @InjectRepository(MentorshipSession)
    private sessionRepository: Repository<MentorshipSession>,
    @InjectRepository(Innovation)
    private innovationRepository: Repository<Innovation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailService: MailService,
    private notificationsService: NotificationsService,
  ) {}

  async bookSession(userId: string, dto: CreateSessionDto): Promise<MentorshipSession> {
    const mentor = await this.mentorProfileRepository.findOne({ 
        where: { id: dto.mentorId },
        relations: ['user']
    });
    if (!mentor) throw new NotFoundException('Mentor not found');

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    // 1. Availability Window Validation
    if (mentor.availability && mentor.availability.length > 0) {
      const dayOfWeek = start.getDay();
      const availabilityRule = mentor.availability.find(a => a.dayOfWeek === dayOfWeek);

      if (!availabilityRule) {
        throw new BadRequestException('Mentor is not available on this day.');
      }

      // Parse HH:mm to minutes for comparison
      const [availStartHour, availStartMin] = availabilityRule.startTime.split(':').map(Number);
      const [availEndHour, availEndMin] = availabilityRule.endTime.split(':').map(Number);
      
      const availStartMinutes = availStartHour * 60 + availStartMin;
      const availEndMinutes = availEndHour * 60 + availEndMin;

      const reqStartMinutes = start.getHours() * 60 + start.getMinutes();
      const reqEndMinutes = end.getHours() * 60 + end.getMinutes();

      if (reqStartMinutes < availStartMinutes || reqEndMinutes > availEndMinutes) {
        throw new BadRequestException(`Mentor is only available between ${availabilityRule.startTime} and ${availabilityRule.endTime} on this day.`);
      }
    }

    // 2. Conflict Validation: Ensure slot is not already booked
    const conflictingSession = await this.sessionRepository.createQueryBuilder('session')
      .where('session.mentorId = :mentorId', { mentorId: dto.mentorId })
      .andWhere('session.status = :status', { status: SessionStatus.SCHEDULED })
      .andWhere('session.startTime < :endTime', { endTime: end })
      .andWhere('session.endTime > :startTime', { startTime: start })
      .getOne();

    if (conflictingSession) {
        throw new ConflictException('This time slot is already booked.');
    }

    const session = this.sessionRepository.create({
        mentorId: dto.mentorId,
        menteeId: userId,
        startTime: start,
        endTime: end,
        notes: dto.notes,
        status: SessionStatus.SCHEDULED,
        // Generate Jitsi meeting link
        meetingLink: `https://meet.jit.si/lms-mentorship-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });

    const savedSession = await this.sessionRepository.save(session);

    // Send Notifications (Non-blocking)
    try {
      const mentee = await this.userRepository.findOne({ where: { id: userId } });
      
      if (mentee && mentor.user) {
          // Notify Mentor
          await this.notificationsService.create({
              userId: mentor.userId,
              title: 'New Mentorship Session',
              message: `You have a new session booked with ${mentee.firstName} ${mentee.lastName} on ${start.toLocaleString()}`,
              type: NotificationType.INFO,
              metadata: { sessionId: savedSession.id }
          });

          await this.mailService.sendMentorshipSessionBookedEmail(
              mentor.user.email,
              mentor.user.firstName,
              `${mentee.firstName} ${mentee.lastName}`,
              start,
              savedSession.meetingLink
          );

          // Notify Mentee
          await this.mailService.sendMentorshipSessionBookedEmail(
              mentee.email,
              mentee.firstName,
              `${mentor.user.firstName} ${mentor.user.lastName}`,
              start,
              savedSession.meetingLink
          );
      }
    } catch (error) {
      this.logger.error('Failed to send session notifications', error);
      // Do not fail the request if notifications fail
    }

    return savedSession;
  }

  async submitFeedback(userId: string, sessionId: string, dto: SubmitFeedbackDto): Promise<MentorshipSession> {
    const session = await this.sessionRepository.findOne({
        where: { id: sessionId }
    });

    if (!session) {
        throw new NotFoundException('Session not found');
    }

    if (session.menteeId !== userId) {
        throw new BadRequestException('Only the mentee can submit feedback for this session');
    }

    if (session.status !== SessionStatus.COMPLETED && session.endTime > new Date()) {
        // Auto-complete session if past end time? Or require explicit completion?
        // For now, allow feedback if current time > end time, and mark as completed.
        if (new Date() < session.endTime) {
             throw new BadRequestException('Cannot submit feedback before session ends');
        }
        session.status = SessionStatus.COMPLETED;
    }

    session.rating = dto.rating;
    session.feedback = dto.feedback;

    return this.sessionRepository.save(session);
  }

  async getSessions(userId: string) {
    // If mentor, find sessions where they are the mentor
    // If student, find sessions where they are the mentee
    
    // We first check if the user is a mentor to determine view? 
    // Or just fetch both and combine? simpler to check role or profile.
    
    // Assuming 'role' passed here is user role, but a user can be both.
    // Let's just fetch all sessions where user is either mentor (via profile) or mentee
    
    const mentorProfile = await this.mentorProfileRepository.findOne({ where: { userId } });
    
    const whereConditions: Record<string, unknown>[] = [{ menteeId: userId }];
    if (mentorProfile) {
        whereConditions.push({ mentorId: mentorProfile.id });
    }

    return this.sessionRepository.find({
        where: whereConditions,
        relations: ['mentor', 'mentor.user', 'mentee'],
        order: { startTime: 'ASC' }
    });
  }

  async findMatches(userId: string) {
    // 1. Get User's Innovations
    const innovations = await this.innovationRepository.find({
        where: { student: { id: userId } }
    });

    // 2. Extract Tags
    const tags = new Set<string>();
    innovations.forEach(inv => inv.tags?.forEach(tag => tags.add(tag.toLowerCase())));
    
    if (tags.size === 0) {
        return []; 
    }

    // 3. Find Mentors with overlapping expertise
    const mentors = await this.mentorProfileRepository.createQueryBuilder('mentor')
        .leftJoinAndSelect('mentor.user', 'user')
        .where('mentor.is_available = :isAvailable', { isAvailable: true })
        // Overlap operator: check if mentor.expertise has ANY overlap with user's tags
        // Note: ILIKE is not directly supported for array overlap in standard SQL without unnesting, 
        // but simple array overlap works if case matches. 
        // For robustness, we'll fetch potentially relevant mentors and filter in memory for fuzzy match
        // or just use standard Postgres array overlap if casing is consistent.
        // Let's assume consistent casing or use a broader search.
        .getMany();

    // 4. Calculate Match Score (In-Memory for better fuzzy matching)
    return mentors
        .map(mentor => {
            const intersection = mentor.expertise.filter(exp => tags.has(exp.toLowerCase()));
            if (intersection.length === 0) return null;

            const score = (intersection.length / Math.max(mentor.expertise.length, 1)) * 100;
            return {
                ...mentor,
                matchScore: Math.round(score),
                matchingSkills: intersection
            };
        })
        .filter(Boolean)
        .sort((a, b) => b.matchScore - a.matchScore);
  }

  async createProfile(userId: string, createDto: CreateMentorProfileDto): Promise<MentorProfile> {
    const existing = await this.mentorProfileRepository.findOne({ where: { userId } });
    if (existing) {
      throw new BadRequestException('Mentor profile already exists');
    }

    const profile = this.mentorProfileRepository.create({
      userId,
      ...createDto,
    });

    return this.mentorProfileRepository.save(profile);
  }

  async updateProfile(userId: string, updateDto: UpdateMentorProfileDto): Promise<MentorProfile> {
    const profile = await this.mentorProfileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Mentor profile not found');
    }

    Object.assign(profile, updateDto);
    return this.mentorProfileRepository.save(profile);
  }

  async getMyProfile(userId: string): Promise<MentorProfile> {
    const profile = await this.mentorProfileRepository.findOne({ 
      where: { userId },
      relations: ['user']
    });
    
    if (!profile) {
      throw new NotFoundException('Mentor profile not found');
    }
    
    return profile;
  }

  async getMentorProfile(mentorId: string): Promise<MentorProfile> {
    const profile = await this.mentorProfileRepository.findOne({ 
      where: { id: mentorId },
      relations: ['user']
    });
    
    if (!profile) {
      throw new NotFoundException('Mentor profile not found');
    }
    
    return profile;
  }

  async findAllMentors(search?: string, expertise?: string): Promise<MentorProfile[]> {
    const queryBuilder = this.mentorProfileRepository.createQueryBuilder('mentor')
      .leftJoinAndSelect('mentor.user', 'user')
      .where('mentor.is_available = :isAvailable', { isAvailable: true });

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR mentor.company ILIKE :search OR mentor.title ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (expertise) {
      // Postgres array overlap operator
      queryBuilder.andWhere(':expertise = ANY(mentor.expertise)', { expertise });
    }

    return queryBuilder.getMany();
  }

  // Request Management
  async createRequest(userId: string, createDto: CreateMentorshipRequestDto): Promise<MentorshipRequest> {
    const mentor = await this.mentorProfileRepository.findOne({ 
        where: { id: createDto.mentorId },
        relations: ['user']
    });
    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }

    if (mentor.userId === userId) {
      throw new BadRequestException('You cannot send a mentorship request to yourself');
    }

    const existingRequest = await this.mentorshipRequestRepository.findOne({
      where: {
        mentorId: createDto.mentorId,
        menteeId: userId,
        status: MentorshipRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('You already have a pending request with this mentor');
    }

    const request = this.mentorshipRequestRepository.create({
      menteeId: userId,
      ...createDto,
    });

    const savedRequest = await this.mentorshipRequestRepository.save(request);

    // Notify Mentor
    const mentee = await this.userRepository.findOne({ where: { id: userId } });
    
    if (mentee && mentor.user) {
        await this.notificationsService.create({
            userId: mentor.userId,
            title: 'New Mentorship Request',
            message: `You have a new mentorship request from ${mentee.firstName} ${mentee.lastName}`,
            type: NotificationType.INFO,
            metadata: { requestId: savedRequest.id }
        });

        await this.mailService.sendMentorshipRequestEmail(
            mentor.user.email,
            mentor.user.firstName,
            `${mentee.firstName} ${mentee.lastName}`
        );
    }

    return savedRequest;
  }

  async updateRequestStatus(
    userId: string,
    requestId: string,
    updateDto: UpdateMentorshipRequestDto
  ): Promise<MentorshipRequest> {
    const request = await this.mentorshipRequestRepository.findOne({
      where: { id: requestId },
      relations: ['mentor', 'mentor.user'],
    });

    if (!request) {
      throw new NotFoundException('Mentorship request not found');
    }

    // Verify ownership (only the mentor can update the status)
    if (request.mentor.userId !== userId) {
      throw new BadRequestException('You are not authorized to update this request');
    }

    Object.assign(request, updateDto);
    const savedRequest = await this.mentorshipRequestRepository.save(request);

    // Notify Mentee
    const mentee = await this.userRepository.findOne({ where: { id: request.menteeId } });
    const mentorUser = request.mentor.user;

    if (mentee && mentorUser) {
        await this.notificationsService.create({
            userId: mentee.id,
            title: `Mentorship Request ${updateDto.status}`,
            message: `Your mentorship request to ${mentorUser.firstName} ${mentorUser.lastName} has been ${updateDto.status.toLowerCase()}`,
            type: NotificationType.INFO,
            metadata: { requestId: savedRequest.id }
        });

        await this.mailService.sendMentorshipRequestStatusEmail(
            mentee.email,
            mentee.firstName,
            `${mentorUser.firstName} ${mentorUser.lastName}`,
            updateDto.status
        );
    }

    return savedRequest;
  }

  async getMyRequestsAsMentee(userId: string): Promise<MentorshipRequest[]> {
    return this.mentorshipRequestRepository.find({
      where: { menteeId: userId },
      relations: ['mentor', 'mentor.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMyRequestsAsMentor(userId: string): Promise<MentorshipRequest[]> {
    const mentorProfile = await this.mentorProfileRepository.findOne({ where: { userId } });
    if (!mentorProfile) {
      return [];
    }

    return this.mentorshipRequestRepository.find({
      where: { mentorId: mentorProfile.id },
      relations: ['mentee'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMentorStats(userId: string) {
    const mentorProfile = await this.mentorProfileRepository.findOne({ where: { userId } });
    if (!mentorProfile) {
        return {
            totalSessions: 0,
            totalHours: 0,
            averageRating: 0,
            totalMentees: 0
        };
    }

    const sessions = await this.sessionRepository.find({
        where: { 
            mentorId: mentorProfile.id,
            status: SessionStatus.COMPLETED
        }
    });

    const totalSessions = sessions.length;
    
    // Calculate total hours
    const totalHours = sessions.reduce((acc, session) => {
        const duration = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60 * 60);
        return acc + duration;
    }, 0);

    // Calculate average rating
    const ratedSessions = sessions.filter(s => s.rating);
    const averageRating = ratedSessions.length > 0
        ? ratedSessions.reduce((acc, s) => acc + (s.rating || 0), 0) / ratedSessions.length
        : 0;

    // Calculate unique mentees
    const uniqueMentees = new Set(sessions.map(s => s.menteeId)).size;

    return {
        totalSessions,
        totalHours: Math.round(totalHours * 10) / 10,
        averageRating: Math.round(averageRating * 10) / 10,
        totalMentees: uniqueMentees
    };
  }
}
