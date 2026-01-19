import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseStatus } from './entities/course.entity';
import { Category } from './entities/category.entity';
import { CourseModule } from './entities/course-module.entity';
import { CourseLesson } from './entities/course-lesson.entity';
import { CourseFile } from './entities/course-file.entity';
import { CreateCourseDto, UpdateCourseDto, CreateModuleDto, CreateLessonDto } from './dto/course.dto';

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
    const { page = 1, limit = 10, search, category, level, status } = query;
    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.modules', 'modules')
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

  async updateLesson(moduleId: string, lessonId: string, updateLessonDto: CreateLessonDto, userId: string): Promise<CourseLesson> {
    const module = await this.moduleRepository.findOne({
      where: { id: moduleId },
      relations: ['course'],
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (module.course.created_by !== userId) {
      throw new ForbiddenException('You can only update lessons in your own courses');
    }

    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId, module_id: moduleId } });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
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
    lesson.content_data = { fileId, fileName: file.original_name, fileType: file.file_type };
    
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

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.category', 'category')
      .where('course.status = :status', { status: 'published' });

    if (q) {
      queryBuilder.andWhere(
        '(course.title ILIKE :search OR course.description ILIKE :search OR course.short_description ILIKE :search)',
        { search: `%${q}%` }
      );
    }

    if (categories.length > 0) {
      queryBuilder.andWhere('course.category_id IN (:...categories)', { categories });
    }

    if (levels.length > 0) {
      queryBuilder.andWhere('course.level IN (:...levels)', { levels });
    }

    if (minPrice > 0 || maxPrice < 1000000) {
      queryBuilder.andWhere('course.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice });
    }

    if (language) {
      queryBuilder.andWhere('course.language = :language', { language });
    }

    if (featured) {
      queryBuilder.andWhere('course.is_featured = true');
    }

    queryBuilder.orderBy(`course.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    const total = await queryBuilder.getCount();
    const courses = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { 
      courses, 
      total,
      filters: {
        availableCategories: await this.getCategories(),
        availableLevels: ['beginner', 'intermediate', 'advanced'],
        priceRange: { min: minPrice, max: maxPrice }
      }
    };
  }

  async getFeaturedCourses(): Promise<Course[]> {
    return this.courseRepository.find({
      where: { is_featured: true, status: CourseStatus.PUBLISHED },
      relations: ['instructor', 'category'],
      order: { created_at: 'DESC' },
      take: 6,
    });
  }

  async getCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });
  }
}