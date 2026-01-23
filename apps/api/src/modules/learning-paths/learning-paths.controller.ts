import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { LearningPathsService } from './learning-paths.service';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { UpdateLearningPathDto } from './dto/update-learning-path.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@Controller('learning-paths')
export class LearningPathsController {
  constructor(private readonly learningPathsService: LearningPathsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  create(@Body() createLearningPathDto: CreateLearningPathDto) {
    return this.learningPathsService.create(createLearningPathDto);
  }

  @Get()
  findAll() {
    return this.learningPathsService.findAll();
  }

  @Get('my-paths')
  @UseGuards(JwtAuthGuard)
  getMyPaths(@Request() req) {
    return this.learningPathsService.getMyPaths(req.user.id);
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  enroll(@Request() req, @Param('id') id: string) {
    return this.learningPathsService.enroll(req.user.id, id);
  }

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  getRecommendations(@Request() req) {
    return this.learningPathsService.getRecommendations(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.learningPathsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  update(@Param('id') id: string, @Body() updateLearningPathDto: UpdateLearningPathDto) {
    return this.learningPathsService.update(id, updateLearningPathDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.learningPathsService.remove(id);
  }
}
