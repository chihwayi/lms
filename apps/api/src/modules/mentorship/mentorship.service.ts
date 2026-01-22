import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, ArrayContains } from 'typeorm';
import { MentorProfile } from './entities/mentor-profile.entity';
import { MentorshipRequest, MentorshipRequestStatus } from './entities/mentorship-request.entity';
import { CreateMentorProfileDto } from './dto/create-mentor-profile.dto';
import { UpdateMentorProfileDto } from './dto/update-mentor-profile.dto';
import { CreateMentorshipRequestDto } from './dto/create-mentorship-request.dto';
import { UpdateMentorshipRequestDto } from './dto/update-mentorship-request.dto';

@Injectable()
export class MentorshipService {
  constructor(
    @InjectRepository(MentorProfile)
    private mentorProfileRepository: Repository<MentorProfile>,
    @InjectRepository(MentorshipRequest)
    private mentorshipRequestRepository: Repository<MentorshipRequest>,
  ) {}

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
    const mentor = await this.mentorProfileRepository.findOne({ where: { id: createDto.mentorId } });
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

    return this.mentorshipRequestRepository.save(request);
  }

  async updateRequestStatus(
    userId: string,
    requestId: string,
    updateDto: UpdateMentorshipRequestDto
  ): Promise<MentorshipRequest> {
    const request = await this.mentorshipRequestRepository.findOne({
      where: { id: requestId },
      relations: ['mentor'],
    });

    if (!request) {
      throw new NotFoundException('Mentorship request not found');
    }

    // Verify ownership (only the mentor can update the status)
    if (request.mentor.userId !== userId) {
      throw new BadRequestException('You are not authorized to update this request');
    }

    Object.assign(request, updateDto);
    return this.mentorshipRequestRepository.save(request);
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
}
