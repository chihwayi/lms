import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KidsSettings } from './entities/kids-settings.entity';

@Injectable()
export class KidsSettingsService {
  constructor(
    @InjectRepository(KidsSettings)
    private repo: Repository<KidsSettings>,
  ) {}

  async getForUser(userId: string): Promise<KidsSettings> {
    let settings = await this.repo.findOne({ where: { user_id: userId } });
    if (!settings) {
      settings = this.repo.create({
        user_id: userId,
        screen_time_limit: true,
        background_music: false,
        sound_effects: true,
      });
      settings = await this.repo.save(settings);
    }
    return settings;
  }

  async updateForUser(userId: string, patch: Partial<KidsSettings>): Promise<KidsSettings> {
    const settings = await this.getForUser(userId);
    Object.assign(settings, {
      screen_time_limit: patch.screen_time_limit ?? settings.screen_time_limit,
      background_music: patch.background_music ?? settings.background_music,
      sound_effects: patch.sound_effects ?? settings.sound_effects,
    });
    return this.repo.save(settings);
  }
}
