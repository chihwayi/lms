import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { LessonsController } from './lessons.controller';
import { Course } from './entities/course.entity';
import { Category } from './entities/category.entity';
import { CourseModule as CourseModuleEntity } from './entities/course-module.entity';
import { CourseLesson } from './entities/course-lesson.entity';
import { CourseFile } from './entities/course-file.entity';
import { LessonNote } from './entities/lesson-note.entity';
import { UsersModule } from '../users/users.module';
import { RbacModule } from '../rbac/rbac.module';
import { CategoriesSeeder } from './categories.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Category,
      CourseModuleEntity,
      CourseLesson,
      CourseFile,
      LessonNote,
    ]),
    UsersModule,
    RbacModule,
  ],
  controllers: [CoursesController, LessonsController],
  providers: [CoursesService, CategoriesSeeder],
  exports: [CoursesService],
})
export class CoursesModule {}