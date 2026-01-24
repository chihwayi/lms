
import { NestFactory } from '@nestjs/core';
import { AppModule } from './apps/api/src/app.module';
import { EnrollmentService } from './apps/api/src/modules/enrollment/enrollment.service';
import { DataSource } from 'typeorm';
import { User } from './apps/api/src/modules/users/entities/user.entity';
import { Course } from './apps/api/src/modules/courses/entities/course.entity';
import { Enrollment } from './apps/api/src/modules/enrollment/entities/enrollment.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  const userId = '58a2ba96-1bd8-44c1-8551-2b1ba11b1bfc';
  const courseId = '693e7988-88cf-4225-8527-4efb5158d3e3';

  console.log('Checking DB...');

  const user = await dataSource.getRepository(User).findOne({ where: { id: userId } });
  console.log('User found:', !!user, user?.email);

  const course = await dataSource.getRepository(Course).findOne({ where: { id: courseId } });
  console.log('Course found:', !!course, course?.title);

  const enrollment = await dataSource.getRepository(Enrollment).findOne({ where: { userId, courseId } });
  console.log('Enrollment found:', !!enrollment);

  await app.close();
}

bootstrap();
