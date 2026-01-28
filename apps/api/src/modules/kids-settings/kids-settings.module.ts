import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KidsSettings } from './entities/kids-settings.entity';
import { KidsSettingsService } from './kids-settings.service';
import { KidsSettingsController } from './kids-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([KidsSettings])],
  providers: [KidsSettingsService],
  controllers: [KidsSettingsController],
  exports: [KidsSettingsService],
})
export class KidsSettingsModule {}
