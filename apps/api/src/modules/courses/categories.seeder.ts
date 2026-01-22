import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesSeeder implements OnModuleInit {
  private readonly logger = new Logger(CategoriesSeeder.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    await this.seedCategories();
  }

  private async seedCategories() {
    const categories = [
      { name: 'Programming', slug: 'programming', is_active: true },
      { name: 'Design', slug: 'design', is_active: true },
      { name: 'Business', slug: 'business', is_active: true },
      { name: 'Marketing', slug: 'marketing', is_active: true },
      { name: 'Data Science', slug: 'data-science', is_active: true },
      { name: 'Language', slug: 'language', is_active: true },
      { name: 'Sciences', slug: 'sciences', is_active: true },
      { name: 'Humanities', slug: 'humanities', is_active: true },
      { name: 'Arts', slug: 'arts', is_active: true },
      { name: 'Mathematics', slug: 'mathematics', is_active: true },
    ];

    for (const category of categories) {
      const existing = await this.categoryRepository.findOne({ where: { name: category.name } });
      if (!existing) {
        this.logger.log(`Seeding category: ${category.name}`);
        await this.categoryRepository.save(category);
      }
    }
  }
}
