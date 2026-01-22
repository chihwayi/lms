import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InnovationsService } from './innovations.service';
import { InnovationsController } from './innovations.controller';
import { InnovationReviewsService } from './innovation-reviews.service';
import { InnovationReviewsController } from './innovation-reviews.controller';
import { Innovation } from './entities/innovation.entity';
import { InnovationReview } from './entities/innovation-review.entity';
import { InnovationMilestone } from './entities/innovation-milestone.entity';
import { InnovationMember } from './entities/innovation-member.entity';
import { InnovationComment } from './entities/innovation-comment.entity';
import { RbacModule } from '../rbac/rbac.module';
import { UsersModule } from '../users/users.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Innovation, InnovationReview, InnovationMilestone, InnovationMember, InnovationComment]),
    RbacModule,
    UsersModule,
    GamificationModule,
  ],
  controllers: [InnovationsController, InnovationReviewsController],
  providers: [InnovationsService, InnovationReviewsService],
  exports: [InnovationsService],
})
export class InnovationsModule {}
