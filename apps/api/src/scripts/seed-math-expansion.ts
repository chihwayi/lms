
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CoursesService } from '../modules/courses/courses.service';
import { UsersService } from '../modules/users/users.service';
import { LessonContentType } from '../modules/courses/entities/course-lesson.entity';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('SeedMathExpansion');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const coursesService = app.get(CoursesService);
    const usersService = app.get(UsersService);

    const adminUser = await usersService.findByEmail('admin@test.com');
    if (!adminUser) {
      logger.error('Admin user not found!');
      return;
    }

    // 1. Expand "Calculus & Graphs" with Differentiation & Integration
    logger.log('Expanding Calculus & Graphs with Differentiation & Integration...');
    const course2Result = await coursesService.findAll({ search: 'Calculus & Graphs', limit: 1 }, { roles: [{ name: 'admin' }] });
    const course2 = course2Result.courses[0];
    
    if (course2) {
       // Module: Differentiation
       const mDiff = await coursesService.createModule(course2.id, {
         title: 'Fundamentals of Differentiation',
         description: 'Limits, First Principles, and Rules of Differentiation.',
         order_index: 2,
         is_published: true,
       }, adminUser.id);

       await coursesService.createLesson(mDiff.id, {
         title: 'Differentiation from First Principles',
         description: 'The definition of the derivative.',
         content_type: LessonContentType.TEXT,
         order_index: 0,
         is_published: true,
         content_data: {
           content: `
             <h3>The Derivative Definition</h3>
             <p>The derivative of a function $f(x)$ is defined as the limit of the secant slope as $h$ approaches zero:</p>
             <p style="text-align: center; font-size: 1.2em; padding: 10px; background: #f0f0f0; border-radius: 8px;">
               $$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$
             </p>
             <p><strong>Example:</strong> Find $f'(x)$ for $f(x) = x^2$.</p>
             <p>
               $$f(x+h) = (x+h)^2 = x^2 + 2xh + h^2$$<br>
               $$f(x+h) - f(x) = 2xh + h^2 = h(2x + h)$$<br>
               $$\\frac{h(2x+h)}{h} = 2x + h$$<br>
               $$\\lim_{h \\to 0} (2x + h) = 2x$$
             </p>
           `
         }
       }, adminUser.id);

       // Module: Integration
       const mInt = await coursesService.createModule(course2.id, {
         title: 'Integration and Area',
         description: 'Indefinite and Definite Integrals.',
         order_index: 3,
         is_published: true,
       }, adminUser.id);

       await coursesService.createLesson(mInt.id, {
         title: 'The Fundamental Theorem of Calculus',
         description: 'Connecting differentiation and integration.',
         content_type: LessonContentType.TEXT,
         order_index: 0,
         is_published: true,
         content_data: {
           content: `
             <h3>Definite Integrals</h3>
             <p>The area under the curve $y=f(x)$ from $x=a$ to $x=b$ is given by:</p>
             <p style="text-align: center; font-size: 1.2em;">
               $$\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)$$
             </p>
             <p>Where $F'(x) = f(x)$.</p>
             <p><strong>Example:</strong> $\\int_{0}^{2} 3x^2 \\, dx$</p>
             <p>Antiderivative $F(x) = x^3$.</p>
             <p>Value $= [x^3]_0^2 = 2^3 - 0^3 = 8$.</p>
           `
         }
       }, adminUser.id);
    }

    // 2. Expand "Geometry Masterclass" with Coordinate Geometry
    logger.log('Expanding Geometry Masterclass with Coordinate Geometry...');
    const course3Result = await coursesService.findAll({ search: 'Geometry Masterclass', limit: 1 }, { roles: [{ name: 'admin' }] });
    const course3 = course3Result.courses[0];

    if (course3) {
        const mCoord = await coursesService.createModule(course3.id, {
            title: 'Coordinate Geometry',
            description: 'Circles and Tangents in the Cartesian Plane.',
            order_index: 3,
            is_published: true,
        }, adminUser.id);

        await coursesService.createLesson(mCoord.id, {
            title: 'Equation of a Circle',
            description: 'Standard form and general form.',
            content_type: LessonContentType.TEXT,
            order_index: 0,
            is_published: true,
            content_data: {
                content: `
                    <h3>The Circle Equation</h3>
                    <p>A circle with center $(a, b)$ and radius $r$ has the equation:</p>
                    <p style="text-align: center; font-size: 1.2em;">
                        $$(x-a)^2 + (y-b)^2 = r^2$$
                    </p>
                    <p><strong>General Form:</strong> $x^2 + y^2 + 2gx + 2fy + c = 0$</p>
                    <p>Center is $(-g, -f)$ and radius is $\\sqrt{g^2 + f^2 - c}$.</p>
                `
            }
        }, adminUser.id);
    }

    // 3. Expand "Advanced Algebra" with Matrices
    logger.log('Expanding Advanced Algebra with Matrices...');
    const course1Result = await coursesService.findAll({ search: 'Advanced Algebra', limit: 1 }, { roles: [{ name: 'admin' }] });
    const course1 = course1Result.courses[0];

    if (course1) {
        const mMatrix = await coursesService.createModule(course1.id, {
            title: 'Matrices and Transformations',
            description: 'Matrix operations and linear transformations.',
            order_index: 2,
            is_published: true,
        }, adminUser.id);

        await coursesService.createLesson(mMatrix.id, {
            title: 'Matrix Multiplication',
            description: 'Rows by Columns.',
            content_type: LessonContentType.TEXT,
            order_index: 0,
            is_published: true,
            content_data: {
                content: `
                    <h3>Multiplying Matrices</h3>
                    <p>For $A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$ and $B = \\begin{pmatrix} x \\\\ y \\end{pmatrix}$:</p>
                    <p style="text-align: center;">
                        $$AB = \\begin{pmatrix} ax + by \\\\ cx + dy \\end{pmatrix}$$
                    </p>
                    <p><strong>Transformation:</strong> A matrix can rotate, stretch, or reflect vectors in the plane.</p>
                    <p>Rotation by $\\theta$:</p>
                    <p>
                        $$R_{\\theta} = \\begin{pmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{pmatrix}$$
                    </p>
                `
            }
        }, adminUser.id);
    }

    logger.log('Math expansion seeding complete!');
  } catch (error) {
    logger.error('Seeding failed', error);
  } finally {
    await app.close();
  }
}

bootstrap();
