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
}
