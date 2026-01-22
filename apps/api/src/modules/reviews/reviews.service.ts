import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Enrollment } from '../enrollment/entities/enrollment.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
  ) {}

  async create(userId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    const { course_id, rating, comment } = createReviewDto;

    // Check if user is enrolled
    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        userId: userId,
        courseId: course_id,
      },
    });

    if (!enrollment) {
      throw new BadRequestException('You must be enrolled in the course to leave a review');
    }

    // Check if review already exists
    const existingReview = await this.reviewRepository.findOne({
      where: {
        user: { id: userId },
        course: { id: course_id },
      },
    });

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      return this.reviewRepository.save(existingReview);
    }

    // Create new review
    const review = this.reviewRepository.create({
      user: { id: userId },
      course: { id: course_id },
      rating,
      comment,
    });

    return this.reviewRepository.save(review);
  }

  async findByCourse(courseId: string): Promise<Review[]> {
    try {
      return await this.reviewRepository.find({
        where: { course: { id: courseId } },
        relations: ['user'],
        order: { created_at: 'DESC' },
      });
    } catch (error) {
      console.error('Error in findByCourse:', error);
      throw error;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({ 
      where: { id },
      relations: ['user']
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.user.id !== userId) {
      throw new BadRequestException('You can only delete your own reviews');
    }

    await this.reviewRepository.remove(review);
  }
}
