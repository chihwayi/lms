import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InnovationReview } from './entities/innovation-review.entity';
import { Innovation } from './entities/innovation.entity';
import { CreateInnovationReviewDto } from './dto/create-innovation-review.dto';

@Injectable()
export class InnovationReviewsService {
  constructor(
    @InjectRepository(InnovationReview)
    private reviewRepository: Repository<InnovationReview>,
    @InjectRepository(Innovation)
    private innovationRepository: Repository<Innovation>,
  ) {}

  async create(createReviewDto: CreateInnovationReviewDto, userId: string, role: string): Promise<InnovationReview> {
    // Only instructors and admins can review
    if (role !== 'instructor' && role !== 'admin' && role !== 'educator') {
      throw new ForbiddenException('Only instructors and admins can submit reviews');
    }

    const innovation = await this.innovationRepository.findOne({
      where: { id: createReviewDto.innovation_id },
    });

    if (!innovation) {
      throw new NotFoundException('Innovation not found');
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      reviewer_id: userId,
    });

    return this.reviewRepository.save(review);
  }

  async findAllByInnovation(innovationId: string): Promise<InnovationReview[]> {
    return this.reviewRepository.find({
      where: { innovation_id: innovationId },
      relations: ['reviewer'],
      order: { created_at: 'DESC' },
    });
  }

  async remove(id: string, userId: string, role: string): Promise<void> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Only the reviewer or an admin can delete
    if (review.reviewer_id !== userId && role !== 'admin') {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewRepository.remove(review);
  }
}
