import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from './entities/achievement.entity';
import { UserAchievement } from './entities/user-achievement.entity';
import { UserXP } from './entities/user-xp.entity';
import { XPLog } from './entities/xp-log.entity';

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
    @InjectRepository(UserXP)
    private userXPRepository: Repository<UserXP>,
    @InjectRepository(XPLog)
    private xpLogRepository: Repository<XPLog>,
  ) {}

  async awardXP(userId: string, amount: number, action: string, entityId?: string) {
    // 1. Log XP
    await this.xpLogRepository.save({
      user_id: userId,
      amount,
      action,
      entity_id: entityId,
    });

    // 2. Update User XP
    let userXP = await this.userXPRepository.findOne({ where: { user_id: userId } });
    if (!userXP) {
      userXP = this.userXPRepository.create({ user_id: userId, total_xp: 0, level: 1 });
    }

    userXP.total_xp += amount;
    userXP.level = this.calculateLevel(userXP.total_xp);
    
    await this.userXPRepository.save(userXP);

    return userXP;
  }

  async checkAndUnlockAchievement(userId: string, achievementSlug: string) {
    const achievement = await this.achievementRepository.findOne({ where: { slug: achievementSlug } });
    if (!achievement) return null;

    const existing = await this.userAchievementRepository.findOne({
      where: { user_id: userId, achievement_id: achievement.id },
    });

    if (existing) return null; // Already unlocked

    // Unlock
    const userAchievement = this.userAchievementRepository.create({
      user_id: userId,
      achievement_id: achievement.id,
    });

    await this.userAchievementRepository.save(userAchievement);

    // Award achievement XP
    if (achievement.xp_reward > 0) {
      await this.awardXP(userId, achievement.xp_reward, `achievement_unlocked:${achievement.slug}`);
    }

    return achievement;
  }

  async getUserStats(userId: string) {
    let userXP = await this.userXPRepository.findOne({ where: { user_id: userId } });
    if (!userXP) {
      userXP = this.userXPRepository.create({ user_id: userId, total_xp: 0, level: 1 });
      await this.userXPRepository.save(userXP);
    }

    const achievements = await this.userAchievementRepository.find({
      where: { user_id: userId },
      relations: ['achievement'],
    });

    const recentLogs = await this.xpLogRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: 10,
    });

    return {
      xp: userXP.total_xp,
      level: userXP.level,
      nextLevelXp: this.calculateXpForNextLevel(userXP.level),
      achievements: achievements.map(ua => ua.achievement),
      recentActivity: recentLogs,
    };
  }

  async getLeaderboard(limit = 10) {
    return this.userXPRepository.find({
      relations: ['user'],
      order: { total_xp: 'DESC' },
      take: limit,
    });
  }

  // Helpers
  private calculateLevel(xp: number): number {
    // Simple formula: Level = floor(sqrt(xp / 100)) + 1
    // 0 XP = Lvl 1
    // 100 XP = Lvl 2
    // 400 XP = Lvl 3
    // 900 XP = Lvl 4
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  private calculateXpForNextLevel(currentLevel: number): number {
    // Inverse of level formula
    return Math.pow(currentLevel, 2) * 100;
  }
}
