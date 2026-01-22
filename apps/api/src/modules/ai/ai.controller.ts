import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('explain')
  async explain(@Body() body: { text: string; context?: string }) {
    return this.aiService.explain(body.text, body.context);
  }

  @Post('generate-quiz')
  async generateQuiz(@Body() body: { topic: string; difficulty: string; count?: number }) {
    return this.aiService.generateQuiz(body.topic, body.difficulty, body.count);
  }
}
