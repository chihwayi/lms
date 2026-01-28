import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('stats')
  async getUserStats(@Request() req) {
    return this.gamificationService.getUserStats(req.user.id);
  }

  @Get('leaderboard')
  async getLeaderboard() {
    return this.gamificationService.getLeaderboard();
  }

  @Get('badges')
  async getAllBadges() {
    return this.gamificationService.getAllBadges();
  }

  @Get('stickers')
  async getStickers(@Request() req) {
    // If query param 'all' is present, return all possible stickers, otherwise user's stickers
    // For now, let's just have specific endpoints
    return this.gamificationService.getUserStickers(req.user.id);
  }

  @Post('stickers/award')
  async awardSticker(@Request() req, @Body() body: { stickerId?: string }) {
    return this.gamificationService.awardSticker(req.user.id, body.stickerId);
  }
}
