
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
// import { CoursesService } from '../modules/courses/courses.service';
import { DataSource } from 'typeorm';
import { Course } from '../modules/courses/entities/course.entity';
import { CourseStatus } from '../modules/courses/entities/course.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // const coursesService = app.get(CoursesService);
  const dataSource = app.get(DataSource);
  const courseRepo = dataSource.getRepository(Course);

  const courseTitle = 'Mathematics: Analytical Geometry';
  
  console.log(`Searching for course: "${courseTitle}"...`);
  
  const course = await courseRepo.findOne({
    where: { title: courseTitle },
    relations: ['modules', 'modules.lessons']
  });

  if (!course) {
    console.error(`Course "${courseTitle}" not found!`);
    await app.close();
    return;
  }

  console.log(`Found course: ${course.id}`);
  console.log(`Current status: ${course.status}`);
  console.log(`Modules: ${course.modules?.length || 0}`);

  if (course.status !== CourseStatus.PUBLISHED) {
    console.log('Publishing course...');
    course.status = CourseStatus.PUBLISHED;
    course.published_at = new Date();
    await courseRepo.save(course);
    console.log('Course published successfully!');
  } else {
    console.log('Course is already published.');
  }

  await app.close();
}

bootstrap();
