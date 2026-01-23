import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { LearningPath } from './entities/learning-path.entity';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { UpdateLearningPathDto } from './dto/update-learning-path.dto';
import { Course } from '../courses/entities/course.entity';
import { User } from '../users/entities/user.entity';
import { GamificationService } from '../gamification/gamification.service';

import { UserLearningPath, LearningPathStatus } from './entities/user-learning-path.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';

@Injectable()
export class LearningPathsService {
  constructor(
    @InjectRepository(LearningPath)
    private learningPathRepository: Repository<LearningPath>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserLearningPath)
    private userLearningPathRepository: Repository<UserLearningPath>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    private gamificationService: GamificationService,
  ) {}

  async enroll(userId: string, learningPathId: string): Promise<UserLearningPath> {
    const existing = await this.userLearningPathRepository.findOne({
      where: { userId, learningPathId },
    });

    if (existing) {
      throw new ConflictException('User already enrolled in this learning path');
    }

    try {
      const enrollment = this.userLearningPathRepository.create({
        userId,
        learningPathId,
      });

      return await this.userLearningPathRepository.save(enrollment);
    } catch (error) {
      console.error('Error enrolling in learning path:', error);
      throw new InternalServerErrorException('Failed to enroll in learning path');
    }
  }

  async getMyPaths(userId: string): Promise<UserLearningPath[]> {
    const userPaths = await this.userLearningPathRepository.find({
      where: { userId },
      relations: ['learningPath', 'learningPath.courses'],
      order: { enrolledAt: 'DESC' },
    });

    // Calculate progress for each path
    for (const userPath of userPaths) {
      const courses = userPath.learningPath.courses;
      if (courses.length === 0) {
        userPath.progress = 0;
        continue;
      }

      const courseIds = courses.map(c => c.id);
      const enrollments = await this.enrollmentRepository.find({
        where: {
          userId,
          courseId: In(courseIds),
        },
      });

      let totalProgress = 0;
      for (const course of courses) {
        const enrollment = enrollments.find(e => e.courseId === course.id);
        totalProgress += enrollment ? enrollment.progress : 0;
      }

      userPath.progress = Math.round(totalProgress / courses.length);
      
      // Update status if needed
      if (userPath.progress === 100 && userPath.status !== LearningPathStatus.COMPLETED) {
        userPath.status = LearningPathStatus.COMPLETED;
        userPath.completedAt = new Date();
        await this.userLearningPathRepository.save(userPath);

        // Award XP and check for achievements
        await this.gamificationService.awardXP(userId, 500, 'learning_path_completed', userPath.learningPathId);
        await this.gamificationService.checkAndUnlockAchievement(userId, 'pathfinder');
      }
    }

    return userPaths;
  }

  async create(createLearningPathDto: CreateLearningPathDto): Promise<LearningPath> {
    const { courseIds, ...rest } = createLearningPathDto;
    
    const courses = await this.courseRepository.findBy({
      id: In(courseIds),
    });

    const learningPath = this.learningPathRepository.create({
      ...rest,
      courses,
    });

    return this.learningPathRepository.save(learningPath);
  }

  async findAll(): Promise<LearningPath[]> {
    return this.learningPathRepository.find({
      relations: ['courses'],
    });
  }

  async findOne(id: string): Promise<LearningPath> {
    const learningPath = await this.learningPathRepository.findOne({
      where: { id },
      relations: ['courses'],
    });

    if (!learningPath) {
      throw new NotFoundException(`Learning Path with ID ${id} not found`);
    }

    return learningPath;
  }

  async update(id: string, updateLearningPathDto: UpdateLearningPathDto): Promise<LearningPath> {
    const learningPath = await this.findOne(id);
    const { courseIds, ...rest } = updateLearningPathDto;

    if (courseIds) {
      const courses = await this.courseRepository.findBy({
        id: In(courseIds),
      });
      learningPath.courses = courses;
    }

    Object.assign(learningPath, rest);

    return this.learningPathRepository.save(learningPath);
  }

  async remove(id: string): Promise<void> {
    const result = await this.learningPathRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Learning Path with ID ${id} not found`);
    }
  }

  async getRecommendations(userId: string): Promise<LearningPath[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.interests || user.interests.length === 0) {
      // If no user or no interests, return all paths sorted by newest
      return this.learningPathRepository.find({
        relations: ['courses'],
        order: { createdAt: 'DESC' },
        take: 5
      });
    }

    const allPaths = await this.learningPathRepository.find({
      relations: ['courses'],
    });

    // Score paths based on interest overlap
    const scoredPaths = allPaths.map(path => {
      let score = 0;
      const pathTags = path.tags || [];
      const titleLower = path.title.toLowerCase();
      const descLower = path.description.toLowerCase();

      user.interests.forEach(interest => {
        const interestLower = interest.toLowerCase();
        
        // Exact tag match (High weight)
        if (pathTags.some(tag => tag.toLowerCase() === interestLower)) {
          score += 10;
        }

        // Title contains interest (Medium weight)
        if (titleLower.includes(interestLower)) {
          score += 5;
        }

        // Description contains interest (Low weight)
        if (descLower.includes(interestLower)) {
          score += 1;
        }
      });

      return { path, score };
    });

    // Sort by score descending and return top 5
    return scoredPaths
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.path)
      .slice(0, 5);
  }
}
