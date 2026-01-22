import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InnovationReviewsService } from './innovation-reviews.service';
import { CreateInnovationReviewDto } from './dto/create-innovation-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';

@Controller('innovations/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InnovationReviewsController {
  constructor(private readonly reviewsService: InnovationReviewsService) {}

  @Post()
  create(@Body() createReviewDto: CreateInnovationReviewDto, @Request() req) {
    return this.reviewsService.create(createReviewDto, req.user.id, req.user.role);
  }

  @Get('innovation/:innovationId')
  findAllByInnovation(@Param('innovationId') innovationId: string) {
    return this.reviewsService.findAllByInnovation(innovationId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(id, req.user.id, req.user.role);
  }
}
