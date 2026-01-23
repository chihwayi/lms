import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { LiveSessionsService } from './live-sessions.service';
import { CreateLiveSessionDto } from './dto/create-live-session.dto';
import { UpdateLiveSessionDto } from './dto/update-live-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@Controller('live-sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LiveSessionsController {
  constructor(private readonly liveSessionsService: LiveSessionsService) {}

  @Post()
  @Roles('instructor', 'admin')
  create(@Body() createLiveSessionDto: CreateLiveSessionDto) {
    return this.liveSessionsService.create(createLiveSessionDto);
  }

  @Get()
  findAll(@Query('courseId') courseId?: string) {
    if (courseId) {
      return this.liveSessionsService.findByCourse(courseId);
    }
    return this.liveSessionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.liveSessionsService.findOne(id);
  }

  @Patch(':id')
  @Roles('instructor', 'admin')
  update(@Param('id') id: string, @Body() updateLiveSessionDto: UpdateLiveSessionDto) {
    return this.liveSessionsService.update(id, updateLiveSessionDto);
  }

  @Delete(':id')
  @Roles('instructor', 'admin')
  remove(@Param('id') id: string) {
    return this.liveSessionsService.remove(id);
  }
}
