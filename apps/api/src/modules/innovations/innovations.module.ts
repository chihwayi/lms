import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InnovationsService } from './innovations.service';
import { InnovationsController } from './innovations.controller';
import { InnovationReviewsService } from './innovation-reviews.service';
import { InnovationReviewsController } from './innovation-reviews.controller';
import { Innovation } from './entities/innovation.entity';
import { InnovationReview } from './entities/innovation-review.entity';
import { RbacModule } from '../rbac/rbac.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Innovation, InnovationReview]),
    RbacModule,
    UsersModule,
  ],
  controllers: [InnovationsController, InnovationReviewsController],
  providers: [InnovationsService, InnovationReviewsService],
  exports: [InnovationsService],
})
export class InnovationsModule {}
