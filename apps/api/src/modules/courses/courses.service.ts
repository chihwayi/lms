import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseStatus, CourseLevel, CourseVisibility } from './entities/course.entity';
import { Category } from './entities/category.entity';
import { CourseModule } from './entities/course-module.entity';
import { CourseLesson, LessonContentType } from './entities/course-lesson.entity';
import { CourseFile } from './entities/course-file.entity';
import { CreateCourseDto, UpdateCourseDto, CreateModuleDto, CreateLessonDto, UpdateLessonDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(CourseModule)
    private moduleRepository: Repository<CourseModule>,
    @InjectRepository(CourseLesson)
    private lessonRepository: Repository<CourseLesson>,
    @InjectRepository(CourseFile)
    private fileRepository: Repository<CourseFile>,
  ) {}

  async create(createCourseDto: CreateCourseDto, userId: string): Promise<Course> {
    const course = this.courseRepository.create({
      ...createCourseDto,
      created_by: userId,
    });
    return this.courseRepository.save(course);
  }

  async findAll(query: any = {}): Promise<{ courses: Course[]; total: number }> {
    const { page = 1, limit = 10, search, category, level, status, instructorId } = query;
    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.modules', 'modules')
      .loadRelationCountAndMap('course.enrollments_count', 'course.enrollments')
      .orderBy('course.created_at', 'DESC');

    if (search) {
      queryBuilder.andWhere(
        '(course.title ILIKE :search OR course.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (category) {
      queryBuilder.andWhere('course.category_id = :category', { category });
    }

    if (level) {
      queryBuilder.andWhere('course.level = :level', { level });
    }

    if (status) {
      queryBuilder.andWhere('course.status = :status', { status });
    }

    if (instructorId) {
      queryBuilder.andWhere('course.created_by = :instructorId', { instructorId });
    }

    const total = await queryBuilder.getCount();
    const courses = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { courses, total };
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['instructor', 'category', 'modules', 'modules.lessons'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, userId: string): Promise<Course> {
    const course = await this.findOne(id);
    
    if (course.created_by !== userId) {
      throw new ForbiddenException('You can only update your own courses');
    }

    Object.assign(course, updateCourseDto);
    return this.courseRepository.save(course);
  }

  async remove(id: string, userId: string): Promise<void> {
    const course = await this.findOne(id);
    
    if (course.created_by !== userId) {
      throw new ForbiddenException('You can only delete your own courses');
    }

    await this.courseRepository.remove(course);
  }

  async publish(id: string, userId: string): Promise<Course> {
    const course = await this.findOne(id);
    
    if (course.created_by !== userId) {
      throw new ForbiddenException('You can only publish your own courses');
    }

    // Validate course is ready for publishing
    if (!course.title || !course.description || !course.category_id) {
      throw new ForbiddenException('Course must have title, description, and category to publish');
    }

    course.status = CourseStatus.PUBLISHED;
    course.published_at = new Date();
    return this.courseRepository.save(course);
  }

  async unpublish(id: string, userId: string): Promise<Course> {
    const course = await this.findOne(id);
    
    if (course.created_by !== userId) {
      throw new ForbiddenException('You can only unpublish your own courses');
    }

    course.status = CourseStatus.UNPUBLISHED;
    return this.courseRepository.save(course);
  }

  // Module management
  async createModule(courseId: string, createModuleDto: CreateModuleDto, userId: string): Promise<CourseModule> {
    const course = await this.findOne(courseId);
    
    if (course.created_by !== userId) {
      throw new ForbiddenException('You can only add modules to your own courses');
    }

    const module = this.moduleRepository.create({
      ...createModuleDto,
      course_id: courseId,
    });
    return this.moduleRepository.save(module);
  }

  async updateModule(courseId: string, moduleId: string, updateModuleDto: CreateModuleDto, userId: string): Promise<CourseModule> {
    const course = await this.findOne(courseId);
    
    if (course.created_by !== userId) {
      throw new ForbiddenException('You can only update modules in your own courses');
    }

    const module = await this.moduleRepository.findOne({ where: { id: moduleId, course_id: courseId } });
    if (!module) {
      throw new NotFoundException('Module not found');
    }

    Object.assign(module, updateModuleDto);
    return this.moduleRepository.save(module);
  }

  async deleteModule(courseId: string, moduleId: string, userId: string): Promise<void> {
    const course = await this.findOne(courseId);
    
    if (course.created_by !== userId) {
      throw new ForbiddenException('You can only delete modules from your own courses');
    }

    const module = await this.moduleRepository.findOne({ where: { id: moduleId, course_id: courseId } });
    if (!module) {
      throw new NotFoundException('Module not found');
    }

    await this.moduleRepository.remove(module);
  }

  async reorderModules(courseId: string, moduleIds: string[], userId: string): Promise<CourseModule[]> {
    const course = await this.findOne(courseId);
    
    if (course.created_by !== userId) {
      throw new ForbiddenException('You can only reorder modules in your own courses');
    }

    const modules = await this.moduleRepository.find({ where: { course_id: courseId } });
    
    for (let i = 0; i < moduleIds.length; i++) {
      const module = modules.find(m => m.id === moduleIds[i]);
      if (module) {
        module.order_index = i + 1;
        await this.moduleRepository.save(module);
      }
    }

    return this.moduleRepository.find({ 
      where: { course_id: courseId }, 
      order: { order_index: 'ASC' } 
    });
  }

  async reorderLessons(moduleId: string, lessonIds: string[], userId: string): Promise<CourseLesson[]> {
    const module = await this.moduleRepository.findOne({
      where: { id: moduleId },
      relations: ['course'],
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (module.course.created_by !== userId) {
      throw new ForbiddenException('You can only reorder lessons in your own courses');
    }

    const lessons = await this.lessonRepository.find({ where: { module_id: moduleId } });
    
    for (let i = 0; i < lessonIds.length; i++) {
      const lesson = lessons.find(l => l.id === lessonIds[i]);
      if (lesson) {
        lesson.order_index = i + 1;
        await this.lessonRepository.save(lesson);
      }
    }

    return this.lessonRepository.find({ 
      where: { module_id: moduleId }, 
      order: { order_index: 'ASC' } 
    });
  }

  async createLesson(moduleId: string, createLessonDto: CreateLessonDto, userId: string): Promise<CourseLesson> {
    const module = await this.moduleRepository.findOne({
      where: { id: moduleId },
      relations: ['course'],
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (module.course.created_by !== userId) {
      throw new ForbiddenException('You can only add lessons to your own courses');
    }

    const lesson = this.lessonRepository.create({
      title: createLessonDto.title,
      description: createLessonDto.description,
      content_type: createLessonDto.content_type,
      content_url: createLessonDto.content_url,
      content_data: createLessonDto.content_data,
      duration_minutes: createLessonDto.duration_minutes || 0,
      order_index: createLessonDto.order_index,
      is_published: createLessonDto.is_published || false,
      is_preview: createLessonDto.is_preview || false,
      module_id: moduleId,
    });
    return await this.lessonRepository.save(lesson);
  }

  async updateLesson(moduleId: string, lessonId: string, updateLessonDto: UpdateLessonDto, userId: string): Promise<CourseLesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId, module_id: moduleId },
      relations: ['module', 'module.course'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.module.course.created_by !== userId) {
      throw new ForbiddenException('You can only update lessons in your own courses');
    }

    Object.assign(lesson, updateLessonDto);
    return this.lessonRepository.save(lesson);
  }

  async updateLessonDirectly(lessonId: string, updateLessonDto: UpdateLessonDto, userId: string): Promise<CourseLesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['module', 'module.course'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.module.course.created_by !== userId) {
      throw new ForbiddenException('You can only update lessons in your own courses');
    }

    Object.assign(lesson, updateLessonDto);
    return this.lessonRepository.save(lesson);
  }

  async deleteLesson(moduleId: string, lessonId: string, userId: string): Promise<void> {
    const module = await this.moduleRepository.findOne({
      where: { id: moduleId },
      relations: ['course'],
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (module.course.created_by !== userId) {
      throw new ForbiddenException('You can only delete lessons from your own courses');
    }

    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId, module_id: moduleId } });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    await this.lessonRepository.remove(lesson);
  }

  // Content assignment
  async assignContentToLesson(lessonId: string, fileId: string, userId: string): Promise<CourseLesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['module', 'module.course'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.module.course.created_by !== userId) {
      throw new ForbiddenException('You can only assign content to your own courses');
    }

    const file = await this.fileRepository.findOne({ where: { id: fileId } });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    lesson.content_url = `/api/v1/files/${fileId}/stream`;
    lesson.content_data = { fileId, fileName: file.original_name, fileType: file.mime_type };
    
    return this.lessonRepository.save(lesson);
  }

  async getLessonContent(lessonId: string): Promise<any> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['files'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return {
      lesson,
      files: lesson.files || [],
      content_url: lesson.content_url,
      content_data: lesson.content_data,
    };
  }

  async removeContentFromLesson(lessonId: string, contentId: string, userId: string): Promise<CourseLesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['module', 'module.course'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.module.course.created_by !== userId) {
      throw new ForbiddenException('You can only remove content from your own courses');
    }

    lesson.content_url = null;
    lesson.content_data = null;
    
    return this.lessonRepository.save(lesson);
  }

  // Publishing workflow
  async schedulePublish(courseId: string, publishDate: string, userId: string): Promise<Course> {
    const course = await this.findOne(courseId);
    
    if (course.created_by !== userId) {
      throw new ForbiddenException('You can only schedule publishing for your own courses');
    }

    course.published_at = new Date(publishDate);
    return this.courseRepository.save(course);
  }

  async getPublishingStatus(courseId: string): Promise<any> {
    const course = await this.findOne(courseId);
    
    const validationErrors = [];
    
    if (!course.title) validationErrors.push('Course title is required');
    if (!course.description) validationErrors.push('Course description is required');
    if (!course.category_id) validationErrors.push('Course category is required');
    if (!course.modules || course.modules.length === 0) validationErrors.push('At least one module is required');
    
    const hasLessons = course.modules?.some(m => m.lessons && m.lessons.length > 0);
    if (!hasLessons) validationErrors.push('At least one lesson is required');
    
    return {
      canPublish: validationErrors.length === 0,
      validationErrors,
      status: course.status,
      publishedAt: course.published_at,
      moduleCount: course.modules?.length || 0,
      lessonCount: course.modules?.reduce((total, m) => total + (m.lessons?.length || 0), 0) || 0,
    };
  }

  // Enhanced search
  async searchCourses(query: any): Promise<{ courses: Course[]; total: number; filters: any }> {
    try {
      const { 
        q = '', 
        categories = [], 
        levels = [], 
        minPrice = 0, 
        maxPrice = 1000000, 
        language = '', 
        featured = false,
        page = 1, 
        limit = 12,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = query;

      let whereClause = "WHERE c.status = 'published'";
      const params: any[] = [];
      let paramIndex = 1;

      if (q) {
        whereClause += ` AND (c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex} OR c.short_description ILIKE $${paramIndex})`;
        params.push(`%${q}%`);
        paramIndex++;
      }

      if (categories && categories.length > 0) {
        whereClause += ` AND c.category_id = ANY($${paramIndex})`;
        params.push(categories);
        paramIndex++;
      }

      if (levels && levels.length > 0) {
        whereClause += ` AND c.level = ANY($${paramIndex})`;
        params.push(levels);
        paramIndex++;
      }

      if (language) {
        whereClause += ` AND c.language = $${paramIndex}`;
        params.push(language);
        paramIndex++;
      }

      if (featured) {
        whereClause += ` AND c.is_featured = $${paramIndex}`;
        params.push(featured === 'true' || featured === true);
        paramIndex++;
      }

      const countQuery = `
        SELECT COUNT(*) as total
        FROM courses c
        ${whereClause}
      `;

      const coursesQuery = `
        SELECT c.id, c.title, c.description, c.short_description, c.level, c.price, 
               c.thumbnail_url, c.language, c.duration_minutes, c.created_at,
               u.first_name as instructor_first_name, u.last_name as instructor_last_name
        FROM courses c
        LEFT JOIN users u ON c.created_by = u.id
        ${whereClause}
        ORDER BY c.${sortBy} ${sortOrder}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      params.push(limit, (page - 1) * limit);

      const [totalResult, courses] = await Promise.all([
        this.courseRepository.query(countQuery, params.slice(0, -2)),
        this.courseRepository.query(coursesQuery, params)
      ]);

      return { 
        courses: courses.map(course => ({
          ...course,
          instructor: {
            firstName: course.instructor_first_name,
            lastName: course.instructor_last_name
          }
        })), 
        total: parseInt(totalResult[0]?.total || '0'),
        filters: {
          availableCategories: [
            { id: '1', name: 'Programming' },
            { id: '2', name: 'Design' },
            { id: '3', name: 'Business' },
            { id: '4', name: 'Marketing' }
          ],
          availableLevels: ['beginner', 'intermediate', 'advanced'],
          priceRange: { min: minPrice, max: maxPrice }
        }
      };
    } catch (error) {
      console.error('Search error:', error);
      return { courses: [], total: 0, filters: {} };
    }
  }

  async getFeaturedCourses(): Promise<any[]> {
    try {
      const result = await this.courseRepository.query(
        `SELECT c.id, c.title, c.description, c.short_description, c.level, c.price, 
                c.thumbnail_url, c.language, c.duration_minutes, c.created_at,
                u.first_name as instructor_first_name, u.last_name as instructor_last_name
         FROM courses c
         LEFT JOIN users u ON c.created_by = u.id
         WHERE c.is_featured = true AND c.status = 'published'
         ORDER BY c.created_at DESC 
         LIMIT 6`
      );
      return result.map(course => ({
        ...course,
        instructor: {
          firstName: course.instructor_first_name,
          lastName: course.instructor_last_name
        }
      }));
    } catch (error) {
      console.error('Featured courses error:', error);
      return [{
        id: 'sample-1',
        title: 'Complete JavaScript Mastery',
        description: 'Master JavaScript from fundamentals to advanced concepts',
        short_description: 'Complete JavaScript course from beginner to advanced',
        level: 'intermediate',
        price: 99.99,
        instructor: {
          firstName: 'John',
          lastName: 'Instructor'
        }
      }];
    }
  }

  async getCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });
  }

  async getCoursePreview(id: string): Promise<any> {
    const course = await this.courseRepository.findOne({
      where: { id, status: CourseStatus.PUBLISHED },
      relations: ['instructor', 'category', 'modules', 'modules.lessons'],
      select: {
        id: true,
        title: true,
        description: true,
        short_description: true,
        level: true,
        price: true,
        thumbnail_url: true,
        trailer_url: true,
        language: true,
        duration_minutes: true,
        is_featured: true,
        created_at: true,
        instructor: {
          id: true,
          firstName: true,
          lastName: true,
        },
        category: {
          id: true,
          name: true,
        },
        modules: {
          id: true,
          title: true,
          description: true,
          order_index: true,
          lessons: {
            id: true,
            title: true,
            description: true,
            duration_minutes: true,
            is_preview: true,
            content_type: true,
            content_data: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found or not published');
    }

    // Filter content for non-preview lessons
    if (course.modules) {
      course.modules.forEach(module => {
        if (module.lessons) {
          module.lessons.forEach(lesson => {
            if (!lesson.is_preview) {
              lesson.content_data = null;
            }
          });
        }
      });
    }

    // Calculate totals
    const totalLessons = course.modules?.reduce((total, m) => total + (m.lessons?.length || 0), 0) || 0;
    const totalDuration = course.modules?.reduce((total, m) => 
      total + (m.lessons?.reduce((lessonTotal, l) => lessonTotal + (l.duration_minutes || 0), 0) || 0), 0
    ) || 0;
    const previewLessons = course.modules?.reduce((total, m) => 
      total + (m.lessons?.filter(l => l.is_preview).length || 0), 0
    ) || 0;

    return {
      ...course,
      stats: {
        totalModules: course.modules?.length || 0,
        totalLessons,
        totalDuration,
        previewLessons,
      },
    };
  }

  async seedMathCourse(instructorId: string) {
    // 1. Create Course
    const course = this.courseRepository.create({
      title: 'Mathematics: Analytical Geometry',
      description: 'A comprehensive guide to Analytical Geometry, covering gradients, straight lines, parallel and perpendicular lines.',
      short_description: 'Master the fundamentals of Analytical Geometry including gradients and straight line equations.',
      level: CourseLevel.INTERMEDIATE,
      status: CourseStatus.PUBLISHED,
      visibility: CourseVisibility.PUBLIC,
      created_by: instructorId,
      language: 'en',
      price: 0,
      thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
    });
    const savedCourse = await this.courseRepository.save(course);

    // Module 1: Gradient and Straight Line
    const module1 = this.moduleRepository.create({
      course_id: savedCourse.id,
      title: 'Module 12: Equation of a Straight Line',
      description: 'Understanding the form y = mx + c',
      order_index: 0,
      is_published: true,
    });
    const savedModule1 = await this.moduleRepository.save(module1);

    const lesson1_1 = this.lessonRepository.create({
      module_id: savedModule1.id,
      title: 'Gradient and y-intercept',
      description: 'Identifying gradient and y-intercept from equations',
      content_type: LessonContentType.TEXT,
      order_index: 0,
      is_published: true,
      duration_minutes: 10,
      content_data: {
        text: `
          <h2>Equation of a straight line of the form $y = mx + c$</h2>
          <p>In the equation $y = mx + c$:</p>
          <ul>
            <li>$m$ represents the <strong>gradient</strong></li>
            <li>$c$ is the <strong>y-intercept</strong></li>
          </ul>
          <h3>Example 2</h3>
          <p>Find the gradient and coordinates of y-axis for the following equations:</p>
          <p>(a) $y = 2x + 3$</p>
          <p><strong>Solution:</strong></p>
          <ul>
            <li>Gradient $m = 2$</li>
            <li>y-intercept $(0; 3)$</li>
          </ul>
          <p>(b) $3x + 4y = 12$</p>
          <p><strong>Solution:</strong></p>
          <p>Make $y$ the subject of the formula:</p>
          <p>$$3x + 4y = 12$$</p>
          <p>$$4y = -3x + 12$$</p>
          <p>$$y = \\frac{-3}{4}x + \\frac{12}{4}$$</p>
          <p>$$y = -\\frac{3}{4}x + 3$$</p>
          <ul>
            <li>Gradient $m = -\\frac{3}{4}$</li>
            <li>y-intercept $(0; 3)$</li>
          </ul>
        `
      }
    });
    await this.lessonRepository.save(lesson1_1);

    // Module 2: Finding Equation
    const module2 = this.moduleRepository.create({
      course_id: savedCourse.id,
      title: 'Module 13: Finding Equation of a Straight Line',
      description: 'How to determine the equation given points or gradient',
      order_index: 1,
      is_published: true,
    });
    const savedModule2 = await this.moduleRepository.save(module2);

    const lesson2_1 = this.lessonRepository.create({
      module_id: savedModule2.id,
      title: 'Given a Point and Gradient',
      description: 'Finding equation using y = mx + c',
      content_type: LessonContentType.TEXT,
      order_index: 0,
      is_published: true,
      duration_minutes: 15,
      content_data: {
        text: `
          <h2>Finding Equation of a Straight Line</h2>
          <p>Equation of a straight line can be given in the form:</p>
          <ol>
            <li>$y = mx + c$</li>
            <li>$ax + by + c = 0$</li>
          </ol>
          <h3>Example 3</h3>
          <p>Find the equation of a straight line passing through point $(-4; 1)$ with gradient $2$.</p>
          <p><strong>Solution:</strong></p>
          <p>Using $y = mx + c$ with $m=2$:</p>
          <p>$$1 = 2(-4) + c$$</p>
          <p>$$1 = -8 + c$$</p>
          <p>$$1 + 8 = c$$</p>
          <p>$$c = 9$$</p>
          <p>So the equation is: $y = 2x + 9$</p>
        `
      }
    });
    await this.lessonRepository.save(lesson2_1);

    // Module 3: Parallel and Perpendicular Lines
    const module3 = this.moduleRepository.create({
      course_id: savedCourse.id,
      title: 'Module 14: Parallel and Perpendicular Lines',
      description: 'Relationships between gradients of lines',
      order_index: 2,
      is_published: true,
    });
    const savedModule3 = await this.moduleRepository.save(module3);

    const lesson3_1 = this.lessonRepository.create({
      module_id: savedModule3.id,
      title: 'Parallel Lines',
      description: 'Lines with the same gradient',
      content_type: LessonContentType.TEXT,
      order_index: 0,
      is_published: true,
      duration_minutes: 10,
      content_data: {
        text: `
          <h2>Parallel Lines</h2>
          <p>Parallel lines have the <strong>same gradient</strong>.</p>
          <p>$$m_1 = m_2$$</p>
          <h3>Example</h3>
          <p>Find the equation of the line parallel to the line with equation $y = 3x - 4$ which passes through the point $(0; 6)$.</p>
          <p><strong>Solution:</strong></p>
          <p>Since parallel lines have the same gradient, $m = 3$.</p>
          <p>The point $(0; 6)$ gives the y-intercept directly ($c = 6$).</p>
          <p>So the equation is: $y = 3x + 6$</p>
        `
      }
    });
    await this.lessonRepository.save(lesson3_1);

    return savedCourse;
  }
}