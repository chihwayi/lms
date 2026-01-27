import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { CertificateTemplate } from './entities/certificate-template.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { RbacModule } from '../rbac/rbac.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CertificateTemplate, Enrollment]),
    RbacModule,
    UsersModule,
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
