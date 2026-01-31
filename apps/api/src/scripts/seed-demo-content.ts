
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CoursesService } from '../modules/courses/courses.service';
import { UsersService } from '../modules/users/users.service';
import { EnrollmentService } from '../modules/enrollment/enrollment.service';
import { CourseLevel, CourseVisibility } from '../modules/courses/entities/course.entity';
import { LessonContentType } from '../modules/courses/entities/course-lesson.entity';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';

async function bootstrap() {
  const logger = new Logger('SeedDemoContent');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const coursesService = app.get(CoursesService);
    const usersService = app.get(UsersService);
    const enrollmentService = app.get(EnrollmentService);
    const userRepository = app.get(getRepositoryToken(User));

    // 1. Ensure Admin Exists
    logger.log('Finding admin user...');
    const adminUser = await usersService.findByEmail('admin@test.com');
    if (!adminUser) {
      logger.error('Admin user (admin@test.com) not found! Please seed admin first.');
      await app.close();
      return;
    }
    logger.log(`Found admin user: ${adminUser.id}`);

    // 2. Ensure Student Exists
    logger.log('Checking/Creating student user...');
    let studentUser = await usersService.findByEmail('student@test.com');
    if (!studentUser) {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      const newUser = userRepository.create({
        email: 'student@test.com',
        passwordHash,
        firstName: 'Test',
        lastName: 'Student',
        isEmailVerified: true,
      });
      studentUser = await userRepository.save(newUser);
      logger.log(`Created student user: ${studentUser.id}`);
    } else {
      logger.log(`Found student user: ${studentUser.id}`);
    }

    // 3. Create Course 1: Advanced Algebra
    logger.log('Creating Course 1: Advanced Algebra...');
    const course1 = await coursesService.create({
      title: 'Advanced Algebra: Simultaneous & Quadratics',
      description: 'Master the art of solving complex algebraic systems and quadratic functions. Includes deep dives into substitution, elimination, and parabolic graphs.',
      short_description: 'Solve systems and master quadratics.',
      level: CourseLevel.ADVANCED,
      language: 'en',
      price: 0,
      visibility: CourseVisibility.PUBLIC,
      is_featured: true,
      duration_minutes: 420,
      thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60',
    }, adminUser.id);

    // Module 1
    const c1m1 = await coursesService.createModule(course1.id, {
      title: 'Simultaneous Equations',
      description: 'Solving systems of linear equations.',
      order_index: 0,
      is_published: true,
    }, adminUser.id);

    // Lessons
    await coursesService.createLesson(c1m1.id, {
      title: 'The Substitution Method',
      description: 'Solving by substituting one variable.',
      content_type: LessonContentType.TEXT,
      order_index: 0,
      is_published: true,
      is_preview: true,
      content_data: {
        content: `
          <h3>The Substitution Method</h3>
          <p>Consider the system:</p>
          <p>
            $y = 2x + 3$ (1)<br>
            $3x + 4y = 24$ (2)
          </p>
          <p>Substitute (1) into (2):</p>
          <p>
            $3x + 4(2x + 3) = 24$<br>
            $3x + 8x + 12 = 24$<br>
            $11x = 12$<br>
            $x = \\frac{12}{11}$
          </p>
        `
      }
    }, adminUser.id);

    // 4. Create Course 2: Calculus & Graphs
    logger.log('Creating Course 2: Calculus & Graphs...');
    const course2 = await coursesService.create({
      title: 'Calculus & Graphs: Variations',
      description: 'Explore the behavior of functions, limits, and derivatives. Understand direct and inverse variation through graphical analysis.',
      short_description: 'Functions, Limits, and Variations.',
      level: CourseLevel.INTERMEDIATE,
      language: 'en',
      price: 0,
      visibility: CourseVisibility.PUBLIC,
      is_featured: true,
      duration_minutes: 300,
      thumbnail_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=60',
    }, adminUser.id);

    const c2m1 = await coursesService.createModule(course2.id, {
      title: 'Direct and Inverse Variation',
      description: 'Analyzing relationships between variables.',
      order_index: 0,
      is_published: true,
    }, adminUser.id);

    await coursesService.createLesson(c2m1.id, {
      title: 'Inverse Variation Graphs',
      description: 'Graphing y = k/x.',
      content_type: LessonContentType.TEXT,
      order_index: 0,
      is_published: true,
      content_data: {
        content: `
          <h3>Inverse Variation</h3>
          <p>If $y$ varies inversely as $x$, then $xy = k$ or $y = \\frac{k}{x}$.</p>
          <p>The graph is a hyperbola. As $x \\to \\infty$, $y \\to 0$.</p>
          <p>Example: $y = \\frac{1}{x}$</p>
        `
      }
    }, adminUser.id);

    // 5. Create Course 3: Geometry Masterclass
    logger.log('Creating Course 3: Geometry Masterclass...');
    const course3 = await coursesService.create({
      title: 'Geometry Masterclass: Triangles & Circles',
      description: 'A complete guide to Euclidean geometry, including circle theorems, vector geometry, and trigonometric properties of triangles.',
      short_description: 'Circle Theorems and Vectors.',
      level: CourseLevel.ADVANCED,
      language: 'en',
      price: 0,
      visibility: CourseVisibility.PUBLIC,
      is_featured: true,
      duration_minutes: 500,
      thumbnail_url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=60',
    }, adminUser.id);

    const c3m1 = await coursesService.createModule(course3.id, {
      title: 'Circle Theorems',
      description: 'Properties of angles in circles.',
      order_index: 0,
      is_published: true,
    }, adminUser.id);

    await coursesService.createLesson(c3m1.id, {
      title: 'Angles in the Same Segment',
      description: 'Theorem proof and application.',
      content_type: LessonContentType.TEXT,
      order_index: 0,
      is_published: true,
      content_data: {
        content: `
          <h3>Theorem: Angles in the Same Segment</h3>
          <p>Angles subtended by the same arc at the circumference are equal.</p>
          <p>
            $\\angle APB = \\angle AQB$
          </p>
          <p>Given points A, B on a circle, and P, Q on the major arc.</p>
        `
      }
    }, adminUser.id);

    // 6. Enroll Student
    logger.log('Enrolling student in courses...');
    const courses = [course1, course2, course3];
    for (const course of courses) {
      try {
        await enrollmentService.enroll(studentUser.id, { courseId: course.id });
        logger.log(`Enrolled student in ${course.title}`);
      } catch (e) {
        logger.warn(`Already enrolled or error: ${e.message}`);
      }
    }

    logger.log('Seeding complete!');
  } catch (error) {
    logger.error('Seeding failed', error);
  } finally {
    await app.close();
  }
}

bootstrap();
