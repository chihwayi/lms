import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement, AchievementType } from '../entities/achievement.entity';

@Injectable()
export class AchievementsSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const achievements = [
      {
        slug: 'first-course-completed',
        title: 'First Step',
        description: 'Complete your first course',
        icon_url: 'trophy',
        type: AchievementType.COURSE,
        xp_reward: 100,
      },
      {
        slug: 'innovation-approved',
        title: 'Innovator',
        description: 'Have an innovation approved',
        icon_url: 'lightbulb',
        type: AchievementType.INNOVATION,
        xp_reward: 200,
      },
      {
        slug: 'quiz-perfect-score',
        title: 'Perfectionist',
        description: 'Score 100% on a quiz',
        icon_url: 'star',
        type: AchievementType.COURSE,
        xp_reward: 50,
      },
      {
        slug: 'innovation-commenter',
        title: 'Active Participant',
        description: 'Post 10 comments on innovations',
        icon_url: 'message-circle',
        type: AchievementType.COMMUNITY,
        xp_reward: 50,
      }
    ];

    for (const achievement of achievements) {
      const existing = await this.achievementRepository.findOne({ where: { slug: achievement.slug } });
      if (!existing) {
        await this.achievementRepository.save(achievement);
      }
    }
  }
}
