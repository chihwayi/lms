import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificateTemplate } from './entities/certificate-template.entity';
import { CreateCertificateTemplateDto } from './dto/create-certificate-template.dto';
import { User } from '../users/entities/user.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(CertificateTemplate)
    private templatesRepository: Repository<CertificateTemplate>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
  ) {}

  async createTemplate(user: User, dto: CreateCertificateTemplateDto) {
    const template = this.templatesRepository.create({
      ...dto,
      created_by: user.id,
    });
    return this.templatesRepository.save(template);
  }

  async findAll() {
    return this.templatesRepository.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: string) {
    const template = await this.templatesRepository.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async generateHtml(enrollmentId: string) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
      relations: ['course', 'course.certificate_template', 'user'],
    });

    if (!enrollment) throw new NotFoundException('Enrollment not found');

    // Use course specific template or find a default one
    let template = enrollment.course.certificate_template;
    
    if (!template) {
        // Fallback to default template if any
        template = await this.templatesRepository.findOne({ where: { is_default: true } });
    }

    if (!template) {
        // Fallback to a hardcoded minimal design if no template exists
        return this.generateDefaultHtml(enrollment);
    }

    return this.renderTemplate(template, enrollment);
  }

  private renderTemplate(template: CertificateTemplate, enrollment: Enrollment): string {
    const elementsHtml = template.elements.map(el => {
      let content = '';
      switch (el.field) {
        case 'student_name':
          content = `${enrollment.user.firstName} ${enrollment.user.lastName}`;
          break;
        case 'course_title':
          content = enrollment.course.title;
          break;
        case 'completion_date':
          content = new Date(enrollment.completedAt || new Date()).toLocaleDateString();
          break;
        case 'instructor_name':
            // Assuming we might fetch instructor relation, or just placeholder for now
          content = 'Instructor'; 
          break;
        case 'custom_text':
          content = el.text || '';
          break;
      }

      const style = `
        position: absolute;
        left: ${el.x}px;
        top: ${el.y}px;
        ${el.width ? `width: ${el.width}px;` : ''}
        font-size: ${el.fontSize || 16}px;
        color: ${el.fontColor || '#000000'};
        font-family: ${el.fontFamily || 'Arial, sans-serif'};
        text-align: ${el.textAlign || 'left'};
      `;

      return `<div style="${style.replace(/\s+/g, ' ')}">${content}</div>`;
    }).join('\n');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; }
          .certificate-container {
            position: relative;
            width: 100%; /* Or fixed width based on design */
            height: 100vh; /* Or fixed height */
            background-image: url('${template.background_url}');
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          ${elementsHtml}
        </div>
      </body>
      </html>
    `;
  }

  private generateDefaultHtml(enrollment: Enrollment): string {
    // Basic fallback logic similar to what was in mobile app
    return `<html><body><h1>Certificate of Completion</h1><p>${enrollment.user.firstName}</p></body></html>`;
  }
}
