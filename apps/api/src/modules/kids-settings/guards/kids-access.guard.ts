import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { KidsSettingsService } from '../kids-settings.service';

@Injectable()
export class KidsAccessGuard implements CanActivate {
  constructor(
    private kidsSettingsService: KidsSettingsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true;
    }

    // Admins and Instructors bypass restrictions
    if (user.role === 'admin' || user.role === 'instructor') {
      return true;
    }

    const settings = await this.kidsSettingsService.getForUser(user.id);
    
    if (settings.screen_time_limit) {
      const now = new Date();
      const hour = now.getHours();
      
      // Default Curfew: 8 PM to 7 AM (20:00 - 07:00)
      if (hour >= 20 || hour < 7) {
        throw new ForbiddenException({
            message: 'Screen time is over for today! Time for bed.',
            code: 'SCREEN_TIME_LIMIT',
            allowedHours: '07:00 - 20:00'
        });
      }
    }

    return true;
  }
}
