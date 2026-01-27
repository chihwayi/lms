import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { MentorshipService } from './mentorship.service';
import { CreateMentorProfileDto } from './dto/create-mentor-profile.dto';
import { UpdateMentorProfileDto } from './dto/update-mentor-profile.dto';
import { CreateMentorshipRequestDto } from './dto/create-mentorship-request.dto';
import { UpdateMentorshipRequestDto } from './dto/update-mentorship-request.dto';
import { CreateSessionDto } from './dto/session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { SubmitFeedbackDto } from './dto/submit-feedback.dto';

@Controller('mentorship')
export class MentorshipController {
  constructor(private readonly mentorshipService: MentorshipService) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats(@Request() req) {
    return this.mentorshipService.getMentorStats(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions')
  bookSession(@Request() req, @Body() dto: CreateSessionDto) {
    return this.mentorshipService.bookSession(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions/:id/feedback')
  submitFeedback(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: SubmitFeedbackDto
  ) {
    return this.mentorshipService.submitFeedback(req.user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  getSessions(@Request() req) {
    return this.mentorshipService.getSessions(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('requests')
  createRequest(@Request() req, @Body() createDto: CreateMentorshipRequestDto) {
    return this.mentorshipService.createRequest(req.user.id, createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('requests/sent')
  getMyRequestsAsMentee(@Request() req) {
    return this.mentorshipService.getMyRequestsAsMentee(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('requests/received')
  getMyRequestsAsMentor(@Request() req) {
    return this.mentorshipService.getMyRequestsAsMentor(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('requests/:id')
  updateRequestStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateMentorshipRequestDto,
  ) {
    return this.mentorshipService.updateRequestStatus(req.user.id, id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  createProfile(@Request() req, @Body() createDto: CreateMentorProfileDto) {
    return this.mentorshipService.createProfile(req.user.id, createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Request() req, @Body() updateDto: UpdateMentorProfileDto) {
    return this.mentorshipService.updateProfile(req.user.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getMyProfile(@Request() req) {
    return this.mentorshipService.getMyProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('matches')
  findMatches(@Request() req) {
    return this.mentorshipService.findMatches(req.user.id);
  }

  @Get('mentors')
  findAllMentors(
    @Query('search') search?: string,
    @Query('expertise') expertise?: string,
  ) {
    return this.mentorshipService.findAllMentors(search, expertise);
  }

  @Get('mentors/:id')
  getMentorProfile(@Param('id') id: string) {
    return this.mentorshipService.getMentorProfile(id);
  }
}
