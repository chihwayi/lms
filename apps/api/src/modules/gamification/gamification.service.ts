import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  private readonly ACHIEVEMENTS = {
    'first-course-completed': {
      name: 'Course Conqueror',
      description: 'Completed your first course!',
      icon: '🎓',
      xpBonus: 100
    },
    'first-lesson-completed': {
      name: 'First Steps',
      description: 'Completed your first lesson!',
      icon: '👣',
      xpBonus: 50
    },
    'quiz-master': {
      name: 'Quiz Master',
      description: 'Passed a quiz with 100% score!',
      icon: '💯',
      xpBonus: 200
    },
    'level-5': {
      name: 'Rising Star',
      description: 'Reached Level 5!',
      icon: '⭐',
      xpBonus: 500
    },
    'level-10': {
      name: 'Legend',
      description: 'Reached Level 10!',
      icon: '👑',
      xpBonus: 1000
    },
    'pathfinder': {
      name: 'Pathfinder',
      description: 'Completed a Learning Path!',
      icon: '🧭',
      xpBonus: 500
    }
  };

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Badge)
    private badgeRepository: Repository<Badge>,
    @InjectRepository(UserBadge)
    private userBadgeRepository: Repository<UserBadge>,
    private notificationsService: NotificationsService,
  ) {}

  async awardXP(userId: string, amount: number, reason?: string, sourceId?: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) return null;

    const oldLevel = user.level;
    user.xp += amount;

    // Simple leveling logic: Level = floor(xp / 1000) + 1
    const newLevel = Math.floor(user.xp / 1000) + 1;
    
    if (newLevel > oldLevel) {
      user.level = newLevel;
      
      // Notify user
      await this.notificationsService.create({
        userId,
        title: 'Level Up! 🎉',
        message: `Congratulations! You reached Level ${newLevel}`,
        type: NotificationType.SUCCESS,
        metadata: { 
          type: 'LEVEL_UP',
          oldLevel, 
          newLevel, 
          currentXp: user.xp 
        }
      });

      // Check for level-based achievements
      await this.checkAndUnlockAchievement(userId, `level-${newLevel}`);
    }

    // Notify XP gain (only for significant amounts to avoid spam)
    if (amount >= 50) {
      await this.notificationsService.create({
        userId,
        title: `+${amount} XP`,
        message: `You earned XP for ${reason || 'activity'}`,
        type: NotificationType.INFO,
        metadata: { 
            type: 'XP_GAIN',
            amount, 
            reason, 
            currentXp: user.xp 
        }
      });
    }

    return await this.userRepository.save(user);
  }

  async checkAndUnlockAchievement(userId: string, achievementId: string) {
    const config = this.ACHIEVEMENTS[achievementId];
    
    // If we don't have a config for this achievement ID, check if it's a dynamic one or ignore
    if (!config) {
        return false;
    }

    // 1. Find or Create Badge
    let badge = await this.badgeRepository.findOneBy({ name: config.name });
    
    if (!badge) {
      badge = this.badgeRepository.create({
        name: config.name,
        description: config.description,
        icon: config.icon,
        xpBonus: config.xpBonus,
        criteria: { trigger: achievementId }
      });
      badge = await this.badgeRepository.save(badge);
      this.logger.log(`Created new badge: ${badge.name}`);
    }

    // 2. Check if user already has it
    const existing = await this.userBadgeRepository.findOne({
        where: { user: { id: userId }, badge: { id: badge.id } }
    });

    if (existing) return false;

    // 3. Award Badge
    await this.awardBadge(userId, badge.id);
    
    // 4. Notify
    await this.notificationsService.create({
        userId,
        title: 'New Badge Unlocked! 🏆',
        message: `You earned the "${badge.name}" badge!`,
        type: NotificationType.SUCCESS,
        metadata: { 
            type: 'BADGE_EARNED',
            badge 
        }
    });

    return true;
  }

  async awardBadge(userId: string, badgeId: string) {
    const existing = await this.userBadgeRepository.findOne({
      where: { user: { id: userId }, badge: { id: badgeId } }
    });

    if (existing) return existing;

    const userBadge = this.userBadgeRepository.create({
      user: { id: userId },
      badge: { id: badgeId }
    });

    const saved = await this.userBadgeRepository.save(userBadge);
    
    // Award XP bonus if badge has it
    const badge = await this.badgeRepository.findOneBy({ id: badgeId });
    if (badge && badge.xpBonus > 0) {
      await this.awardXP(userId, badge.xpBonus, 'badge_earned', badge.id);
    }

    return saved;
  }

  async getUserStats(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    const badges = await this.userBadgeRepository.find({
      where: { user: { id: userId } },
      relations: ['badge'],
      order: { awardedAt: 'DESC' }
    });

    const nextLevelXp = user.level * 1000;
    const progress = Math.min(100, Math.floor(((user.xp % 1000) / 1000) * 100)); // Percentage within current level

    return {
      level: user.level,
      xp: user.xp,
      nextLevelXp,
      progress,
      badges: badges.map(ub => ({
        ...ub.badge,
        awardedAt: ub.awardedAt
      }))
    };
  }

  async getLeaderboard(limit: number = 10) {
    return this.userRepository.find({
      select: ['id', 'firstName', 'lastName', 'avatar', 'xp', 'level'],
      order: { xp: 'DESC' },
      take: limit
    });
  }

  async createBadge(data: Partial<Badge>) {
    const badge = this.badgeRepository.create(data);
    return this.badgeRepository.save(badge);
  }

  async getAllBadges() {
    return this.badgeRepository.find();
  }
}
