import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { KidsSettingsService } from './kids-settings.service';

@Controller('kids-settings')
@UseGuards(JwtAuthGuard)
export class KidsSettingsController {
  constructor(private readonly service: KidsSettingsService) {}

  @Get()
  getMine(@Req() req: any) {
    return this.service.getForUser(req.user.id);
  }

  @Patch()
  updateMine(@Req() req: any, @Body() body: any) {
    return this.service.updateForUser(req.user.id, body);
  }
}
