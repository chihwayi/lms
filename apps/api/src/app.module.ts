import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import * as Joi from 'joi';
import { join } from 'path';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { AdminModule } from './modules/admin/admin.module';
import { CoursesModule } from './modules/courses/courses.module';
import { FilesModule } from './modules/files/files.module';
import { ContentModule } from './modules/content/content.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { InnovationsModule } from './modules/innovations/innovations.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { MentorshipModule } from './modules/mentorship/mentorship.module';
import { AiModule } from './modules/ai/ai.module';
import { ChatModule } from './modules/chat/chat.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { LiveSessionsModule } from './modules/live-sessions/live-sessions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MailModule } from './modules/mail/mail.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { LearningPathsModule } from './modules/learning-paths/learning-paths.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { LessonSubmissionsModule } from './modules/lesson-submissions/lesson-submissions.module';
import { KidsSettingsModule } from './modules/kids-settings/kids-settings.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().default(3001),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        MINIO_ENDPOINT: Joi.string().required(),
        MINIO_PORT: Joi.number().default(9000),
        MINIO_ACCESS_KEY: Joi.string().required(),
        MINIO_SECRET_KEY: Joi.string().required(),
      }),
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'eduflow',
      password: process.env.DATABASE_PASSWORD || 'password',
      database: process.env.DATABASE_NAME || 'eduflow_dev',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      migrationsRun: process.env.NODE_ENV === 'production',
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    RbacModule,
    AdminModule,
    CoursesModule,
    FilesModule,
    ContentModule,
    EnrollmentModule,
    ReviewsModule,
    InnovationsModule,
    GamificationModule,
    MentorshipModule,
    AiModule,
    ChatModule,
    CalendarModule,
    LiveSessionsModule,
    NotificationsModule,
    MailModule,
    AnalyticsModule,
    LearningPathsModule,
    CertificatesModule,
    LessonSubmissionsModule,
    KidsSettingsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
