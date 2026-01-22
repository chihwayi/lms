import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { InnovationsService } from './innovations.service';
import { CreateInnovationDto } from './dto/create-innovation.dto';
import { UpdateInnovationDto } from './dto/update-innovation.dto';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReviewInnovationDto } from './dto/review-innovation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';

@Controller('innovations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InnovationsController {
  constructor(private readonly innovationsService: InnovationsService) {}

  @Post()
  create(@Body() createInnovationDto: CreateInnovationDto, @Request() req) {
    return this.innovationsService.create(createInnovationDto, req.user.id);
  }

  @Get()
  findAll(@Request() req, @Query('status') status?: string) {
    return this.innovationsService.findAll(req.user.id, req.user.role, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.innovationsService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInnovationDto: UpdateInnovationDto,
    @Request() req,
  ) {
    return this.innovationsService.update(id, updateInnovationDto, req.user.id, req.user.role);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string, @Request() req) {
    return this.innovationsService.submit(id, req.user.id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Request() req) {
    return this.innovationsService.approve(id, req.user.id, req.user.role);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Request() req) {
    return this.innovationsService.reject(id, req.user.id, req.user.role);
  }

  @Patch(':id/review')
  review(
    @Param('id') id: string, 
    @Body() reviewDto: ReviewInnovationDto,
    @Request() req
  ) {
    return this.innovationsService.review(id, reviewDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.innovationsService.remove(id, req.user.id, req.user.role);
  }

  // Milestone Endpoints
  @Post(':id/milestones')
  addMilestone(
    @Param('id') id: string,
    @Body() createMilestoneDto: CreateMilestoneDto,
    @Request() req,
  ) {
    return this.innovationsService.addMilestone(id, createMilestoneDto, req.user.id, req.user.role);
  }

  @Patch(':id/milestones/:milestoneId')
  updateMilestone(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Body() updateMilestoneDto: UpdateMilestoneDto,
    @Request() req,
  ) {
    return this.innovationsService.updateMilestone(
      id,
      milestoneId,
      updateMilestoneDto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id/milestones/:milestoneId')
  deleteMilestone(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Request() req,
  ) {
    return this.innovationsService.deleteMilestone(id, milestoneId, req.user.id, req.user.role);
  }

  // Team Endpoints
  @Post(':id/team')
  addTeamMember(
    @Param('id') id: string,
    @Body() addTeamMemberDto: AddTeamMemberDto,
    @Request() req,
  ) {
    return this.innovationsService.addTeamMember(id, addTeamMemberDto, req.user.id, req.user.role);
  }

  @Delete(':id/team/:memberId')
  removeTeamMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Request() req,
  ) {
    return this.innovationsService.removeTeamMember(id, memberId, req.user.id, req.user.role);
  }

  // Comment Endpoints
  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    return this.innovationsService.addComment(id, createCommentDto, req.user.id);
  }

  @Get(':id/comments')
  getComments(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.innovationsService.getComments(id, req.user.id, req.user.role);
  }

  @Delete('comments/:commentId')
  deleteComment(
    @Param('commentId') commentId: string,
    @Request() req,
  ) {
    return this.innovationsService.deleteComment(commentId, req.user.id, req.user.role);
  }
}
