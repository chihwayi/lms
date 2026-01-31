
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CoursesService } from '../modules/courses/courses.service';
import { UsersService } from '../modules/users/users.service';
import { LessonContentType } from '../modules/courses/entities/course-lesson.entity';
import { Logger } from '@nestjs/common';
import { Like } from 'typeorm';

async function bootstrap() {
  const logger = new Logger('SeedMoreMathContent');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const coursesService = app.get(CoursesService);
    const usersService = app.get(UsersService);

    logger.log('Finding admin user...');
    const adminUser = await usersService.findByEmail('admin@test.com');
    if (!adminUser) {
      logger.error('Admin user not found!');
      return;
    }

    // --- 1. Expand "Advanced Algebra" ---
    logger.log('Expanding Advanced Algebra...');
    const course1Result = await coursesService.findAll({ search: 'Advanced Algebra', limit: 1 }, { roles: [{ name: 'admin' }] });
    const course1 = course1Result.courses[0];
    
    if (course1) {
      // Module: Quadratics
      const c1m2 = await coursesService.createModule(course1.id, {
        title: 'Quadratics Equations & Functions',
        description: 'Solving quadratics via formula and completing the square.',
        order_index: 1,
        is_published: true,
      }, adminUser.id);

      // Lesson: Quadratic Formula
      await coursesService.createLesson(c1m2.id, {
        title: 'The Quadratic Formula',
        description: 'Derivation and application.',
        content_type: LessonContentType.TEXT,
        order_index: 0,
        is_published: true,
        content_data: {
          content: `
            <h3>The Quadratic Formula</h3>
            <p>For any quadratic equation $ax^2 + bx + c = 0$, the roots are given by:</p>
            <p style="text-align: center; font-size: 1.2em;">
              $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
            </p>
            <p><strong>The Discriminant:</strong> $\\Delta = b^2 - 4ac$ determines the nature of roots.</p>
            <ul>
              <li>If $\\Delta > 0$: Two distinct real roots.</li>
              <li>If $\\Delta = 0$: One repeated real root.</li>
              <li>If $\\Delta < 0$: No real roots (complex roots).</li>
            </ul>
          `
        }
      }, adminUser.id);

      // Lesson: Completing the Square
      await coursesService.createLesson(c1m2.id, {
        title: 'Completing the Square',
        description: 'Transforming quadratics into vertex form.',
        content_type: LessonContentType.TEXT,
        order_index: 1,
        is_published: true,
        content_data: {
          content: `
            <h3>Completing the Square</h3>
            <p>To convert $ax^2 + bx + c$ into $a(x+p)^2 + q$:</p>
            <ol>
              <li>Factor out $a$: $a(x^2 + \\frac{b}{a}x) + c$</li>
              <li>Add and subtract $(\\frac{b}{2a})^2$: $a[(x + \\frac{b}{2a})^2 - (\\frac{b}{2a})^2] + c$</li>
              <li>Simplify.</li>
            </ol>
            <p><strong>Example:</strong> $x^2 + 6x + 5$</p>
            <p>$(x+3)^2 - 9 + 5 = (x+3)^2 - 4$</p>
            <p>Vertex is at $(-3, -4)$.</p>
          `
        }
      }, adminUser.id);
    }

    // --- 2. Expand "Calculus & Graphs" ---
    logger.log('Expanding Calculus & Graphs...');
    const course2Result = await coursesService.findAll({ search: 'Calculus & Graphs', limit: 1 }, { roles: [{ name: 'admin' }] });
    const course2 = course2Result.courses[0];

    if (course2) {
      // Module: Trigonometric Graphs
      const c2m2 = await coursesService.createModule(course2.id, {
        title: 'Trigonometric Graphs',
        description: 'Visualizing Sin, Cos, and Tan functions.',
        order_index: 1,
        is_published: true,
      }, adminUser.id);

      await coursesService.createLesson(c2m2.id, {
        title: 'The Sine and Cosine Waves',
        description: 'Amplitude, period, and phase shift.',
        content_type: LessonContentType.TEXT,
        order_index: 0,
        is_published: true,
        content_data: {
          content: `
            <h3>The Sine Function $y = a\\sin(bx + c) + d$</h3>
            <ul>
              <li><strong>Amplitude ($|a|$):</strong> Peak deviation from center.</li>
              <li><strong>Period ($2\\pi/|b|$):</strong> Length of one cycle.</li>
              <li><strong>Phase Shift ($-c/b$):</strong> Horizontal translation.</li>
            </ul>
            <p>Standard $y = \\sin(x)$ starts at $(0,0)$, peaks at $(\\pi/2, 1)$, crosses at $(\\pi, 0)$.</p>
            <p>Standard $y = \\cos(x)$ starts at $(0,1)$, crosses at $(\\pi/2, 0)$, troughs at $(\\pi, -1)$.</p>
          `
        }
      }, adminUser.id);
    }

    // --- 3. Expand "Geometry Masterclass" ---
    logger.log('Expanding Geometry Masterclass...');
    const course3Result = await coursesService.findAll({ search: 'Geometry Masterclass', limit: 1 }, { roles: [{ name: 'admin' }] });
    const course3 = course3Result.courses[0];

    if (course3) {
      // Module: Vectors
      const c3m2 = await coursesService.createModule(course3.id, {
        title: 'Vectors',
        description: 'Magnitude, direction, and operations.',
        order_index: 1,
        is_published: true,
      }, adminUser.id);

      await coursesService.createLesson(c3m2.id, {
        title: 'Introduction to Vectors',
        description: 'Scalars vs Vectors.',
        content_type: LessonContentType.TEXT,
        order_index: 0,
        is_published: true,
        content_data: {
          content: `
            <h3>Vectors</h3>
            <p>A vector has both <strong>magnitude</strong> and <strong>direction</strong>.</p>
            <p>Represented as column vectors:</p>
            <p>
              $$\\mathbf{v} = \\begin{pmatrix} x \\\\ y \\end{pmatrix}$$
            </p>
            <p><strong>Magnitude:</strong> $|\\mathbf{v}| = \\sqrt{x^2 + y^2}$</p>
            <p><strong>Addition:</strong> $\\begin{pmatrix} a \\\\ b \\end{pmatrix} + \\begin{pmatrix} c \\\\ d \\end{pmatrix} = \\begin{pmatrix} a+c \\\\ b+d \\end{pmatrix}$</p>
          `
        }
      }, adminUser.id);

      // Module: Triangle Trigonometry
      const c3m3 = await coursesService.createModule(course3.id, {
        title: 'Triangle Trigonometry',
        description: 'Sine and Cosine rules.',
        order_index: 2,
        is_published: true,
      }, adminUser.id);

      await coursesService.createLesson(c3m3.id, {
        title: 'Sine and Cosine Rules',
        description: 'Solving non-right-angled triangles.',
        content_type: LessonContentType.TEXT,
        order_index: 0,
        is_published: true,
        content_data: {
          content: `
            <h3>The Sine Rule</h3>
            <p>For any triangle with sides $a, b, c$ opposite angles $A, B, C$:</p>
            <p>
              $$\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}$$
            </p>
            
            <h3>The Cosine Rule</h3>
            <p>Use when you have SAS (Side-Angle-Side) or SSS:</p>
            <p>
              $$c^2 = a^2 + b^2 - 2ab\\cos C$$
            </p>
            <p>Or for angles:</p>
            <p>
              $$\\cos C = \\frac{a^2 + b^2 - c^2}{2ab}$$
            </p>
          `
        }
      }, adminUser.id);
    }

    logger.log('Extended seeding complete!');
  } catch (error) {
    logger.error('Extended seeding failed', error);
  } finally {
    await app.close();
  }
}

bootstrap();
