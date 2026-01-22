import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationService } from './gamification.service';
import { GamificationController } from './gamification.controller';
import { Achievement } from './entities/achievement.entity';
import { UserAchievement } from './entities/user-achievement.entity';
import { UserXP } from './entities/user-xp.entity';
import { XPLog } from './entities/xp-log.entity';
import { AchievementsSeeder } from './seeding/achievements.seeder';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Achievement, UserAchievement, UserXP, XPLog]),
  ],
  controllers: [GamificationController],
  providers: [GamificationService, AchievementsSeeder],
  exports: [GamificationService],
})
export class GamificationModule {}
