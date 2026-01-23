import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      user_id: createNotificationDto.userId,
      title: createNotificationDto.title,
      message: createNotificationDto.message,
      type: createNotificationDto.type || NotificationType.INFO,
      metadata: createNotificationDto.metadata,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // Send real-time notification
    this.notificationsGateway.sendNotificationToUser(createNotificationDto.userId, savedNotification);

    return savedNotification;
  }

  async findAll(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findUnread(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user_id: userId, is_read: false },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(id: string): Promise<void> {
    await this.notificationRepository.update(id, { is_read: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update({ user_id: userId, is_read: false }, { is_read: true });
  }
}
