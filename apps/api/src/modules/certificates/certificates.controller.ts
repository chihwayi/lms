import { Controller, Get, Post, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CertificatesService } from './certificates.service';
import { CreateCertificateTemplateDto } from './dto/create-certificate-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@Controller('certificates')
@UseGuards(JwtAuthGuard)
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post('upload-background')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadBackground(@UploadedFile() file: Express.Multer.File) {
    // Return the URL relative to the server
    return { url: `${process.env.API_URL || 'http://localhost:3001'}/uploads/${file.filename}` };
  }

  @Post('templates')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  createTemplate(@Request() req, @Body() dto: CreateCertificateTemplateDto) {
    return this.certificatesService.createTemplate(req.user, dto);
  }

  @Get('templates')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  findAllTemplates() {
    return this.certificatesService.findAll();
  }

  @Get('templates/:id')
  findOneTemplate(@Param('id') id: string) {
    return this.certificatesService.findOne(id);
  }

  @Get('render/:enrollmentId')
  generateCertificate(@Param('enrollmentId') enrollmentId: string) {
    // This endpoint returns HTML string
    // In a real app, you might stream a PDF or return a JSON with html property
    return this.certificatesService.generateHtml(enrollmentId);
  }
}
