
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CoursesService } from '../modules/courses/courses.service';
import { UsersService } from '../modules/users/users.service';
import { CourseLevel, CourseStatus, CourseVisibility } from '../modules/courses/entities/course.entity';
import { LessonContentType } from '../modules/courses/entities/course-lesson.entity';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('SeedMathCourse');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const coursesService = app.get(CoursesService);
    const usersService = app.get(UsersService);

    logger.log('Finding admin user...');
    const adminUser = await usersService.findByEmail('admin@test.com');
    
    if (!adminUser) {
      logger.error('Admin user not found! Cannot create course.');
      await app.close();
      return;
    }

    logger.log(`Found admin user: ${adminUser.id}`);

    // Create Course
    logger.log('Creating Mathematics course...');
    const course = await coursesService.create({
      title: 'Mathematics: Analytical Geometry',
      description: 'A comprehensive guide to Analytical Geometry, covering distance, gradient, equations of lines, and more. This course is designed for high school students.',
      short_description: 'Master Analytical Geometry with ease.',
      level: CourseLevel.INTERMEDIATE,
      language: 'en',
      price: 0,
      visibility: CourseVisibility.PUBLIC,
      is_featured: true,
      duration_minutes: 120,
    }, adminUser.id);
    
    logger.log(`Course created: ${course.id}`);

    // Create Module 12
    logger.log('Creating Module 12...');
    const module12 = await coursesService.createModule(course.id, {
      title: 'Module 12: Analytical Geometry',
      description: 'Introduction to Analytical Geometry concepts.',
      order_index: 0,
      is_published: true,
    }, adminUser.id);

    logger.log(`Module 12 created: ${module12.id}`);

    // Lesson 1: Distance Formula
    logger.log('Creating Lesson 12.1...');
    await coursesService.createLesson(module12.id, {
      title: '12.1 Distance Formula',
      description: 'Calculate the distance between two points.',
      content_type: LessonContentType.TEXT,
      order_index: 0,
      is_published: true,
      is_preview: true,
      content_data: {
        content: `
          <h2>The Distance Formula</h2>
          <p>The distance between two points $(x_1, y_1)$ and $(x_2, y_2)$ in a Cartesian plane is given by the formula:</p>
          <p style="text-align: center;">
            $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$
          </p>
          <p><strong>Example:</strong> Find the distance between A(2, 3) and B(5, 7).</p>
          <p>
            $d = \\sqrt{(5 - 2)^2 + (7 - 3)^2}$<br>
            $d = \\sqrt{3^2 + 4^2}$<br>
            $d = \\sqrt{9 + 16}$<br>
            $d = \\sqrt{25} = 5$
          </p>
        `
      }
    }, adminUser.id);

    // Lesson 2: Gradient
    logger.log('Creating Lesson 12.2...');
    await coursesService.createLesson(module12.id, {
      title: '12.2 Gradient of a Line',
      description: 'Understanding the slope of a line.',
      content_type: LessonContentType.TEXT,
      order_index: 1,
      is_published: true,
      content_data: {
        content: `
          <h2>Gradient (Slope)</h2>
          <p>The gradient $m$ of a line passing through two points $(x_1, y_1)$ and $(x_2, y_2)$ is:</p>
          <p style="text-align: center;">
            $m = \\frac{y_2 - y_1}{x_2 - x_1}$
          </p>
          <p>Where $x_1 \\neq x_2$.</p>
          <h3>Types of Gradients:</h3>
          <ul>
            <li><strong>Positive Gradient:</strong> Line goes up from left to right.</li>
            <li><strong>Negative Gradient:</strong> Line goes down from left to right.</li>
            <li><strong>Zero Gradient:</strong> Horizontal line ($y_1 = y_2$).</li>
            <li><strong>Undefined Gradient:</strong> Vertical line ($x_1 = x_2$).</li>
          </ul>
        `
      }
    }, adminUser.id);

    // Lesson 3: Equation of a Line
    logger.log('Creating Lesson 12.3...');
    await coursesService.createLesson(module12.id, {
      title: '12.3 Equation of a Straight Line',
      description: 'Forms of linear equations.',
      content_type: LessonContentType.TEXT,
      order_index: 2,
      is_published: true,
      content_data: {
        content: `
          <h2>Equation of a Straight Line</h2>
          <p>There are two common forms:</p>
          <h3>1. Gradient-Intercept Form</h3>
          <p>$y = mx + c$</p>
          <p>Where $m$ is the gradient and $c$ is the y-intercept.</p>
          
          <h3>2. Point-Gradient Form</h3>
          <p>$y - y_1 = m(x - x_1)$</p>
          <p>Used when you know a point $(x_1, y_1)$ and the gradient $m$.</p>
        `
      }
    }, adminUser.id);

    // Lesson 4: Parallel and Perpendicular
    logger.log('Creating Lesson 12.4...');
    await coursesService.createLesson(module12.id, {
      title: '12.4 Parallel and Perpendicular Lines',
      description: 'Relationships between gradients.',
      content_type: LessonContentType.TEXT,
      order_index: 3,
      is_published: true,
      content_data: {
        content: `
          <h2>Parallel and Perpendicular Lines</h2>
          <h3>Parallel Lines</h3>
          <p>Two lines are parallel if their gradients are equal:</p>
          <p>$m_1 = m_2$</p>
          
          <h3>Perpendicular Lines</h3>
          <p>Two lines are perpendicular if the product of their gradients is -1:</p>
          <p>$m_1 \\times m_2 = -1$</p>
          <p>Or:</p>
          <p>$m_1 = -\\frac{1}{m_2}$</p>
        `
      }
    }, adminUser.id);

    logger.log('Seeding completed successfully!');

  } catch (error) {
    logger.error('Seeding failed', error);
  } finally {
    await app.close();
  }
}

bootstrap();
