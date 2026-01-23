import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: 'ok',
      app: 'EduFlow',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  }

  getReadiness() {
    return {
      status: 'ready',
      checks: {
        database: 'ok',
        redis: 'ok',
      },
      timestamp: new Date().toISOString(),
    };
  }
}