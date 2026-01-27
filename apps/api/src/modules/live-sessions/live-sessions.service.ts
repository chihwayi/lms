import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LiveSession, SessionStatus } from './entities/live-session.entity';
import { CreateLiveSessionDto } from './dto/create-live-session.dto';
import { UpdateLiveSessionDto } from './dto/update-live-session.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { MailService } from '../mail/mail.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class LiveSessionsService {
  private readonly logger = new Logger(LiveSessionsService.name);

  constructor(
    @InjectRepository(LiveSession)
    private readonly liveSessionRepository: Repository<LiveSession>,
    private readonly notificationsService: NotificationsService,
    private readonly enrollmentService: EnrollmentService,
    private readonly mailService: MailService,
  ) {}

  async create(createLiveSessionDto: CreateLiveSessionDto): Promise<LiveSession> {
    const session = this.liveSessionRepository.create(createLiveSessionDto);
    const savedSession = await this.liveSessionRepository.save(session);

    // Notify enrolled students about the new session
    this.notifyStudentsAboutNewSession(savedSession);

    return savedSession;
  }

  async findAll(): Promise<LiveSession[]> {
    return await this.liveSessionRepository.find();
  }

  async findByCourse(courseId: string): Promise<LiveSession[]> {
    return await this.liveSessionRepository.find({
      where: { course_id: courseId },
      order: { start_time: 'ASC' },
    });
  }

  async findOne(id: string): Promise<LiveSession> {
    const session = await this.liveSessionRepository.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException(`Live session with ID ${id} not found`);
    }
    return session;
  }

  async update(id: string, updateLiveSessionDto: UpdateLiveSessionDto): Promise<LiveSession> {
    const session = await this.findOne(id);
    const updatedSession = this.liveSessionRepository.merge(session, updateLiveSessionDto);
    return await this.liveSessionRepository.save(updatedSession);
  }

  async remove(id: string): Promise<void> {
    const result = await this.liveSessionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Live session with ID ${id} not found`);
    }
  }

  private async notifyStudentsAboutNewSession(session: LiveSession) {
    try {
      const students = await this.enrollmentService.getEnrolledStudents(session.course_id);
      
      for (const student of students) {
        await this.notificationsService.create({
          userId: student.id,
          title: 'New Live Session Scheduled',
          message: `A new live session "${session.title}" has been scheduled for your course.`,
          type: NotificationType.INFO,
          metadata: {
            sessionId: session.id,
            courseId: session.course_id,
            startTime: session.start_time,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to notify students about new session: ${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleUpcomingSessionReminders() {
    const now = new Date();
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60000);

    // Find sessions starting within the next 15 minutes that haven't been notified yet
    const upcomingSessions = await this.liveSessionRepository.find({
      where: {
        start_time: Between(now, fifteenMinutesFromNow),
        notification_sent: false,
        status: SessionStatus.SCHEDULED,
      },
      relations: ['course'],
    });

    if (upcomingSessions.length === 0) return;

    this.logger.log(`Found ${upcomingSessions.length} upcoming sessions to notify.`);

    for (const session of upcomingSessions) {
      const students = await this.enrollmentService.getEnrolledStudents(session.course_id);
      
      for (const student of students) {
        // In-app notification
        await this.notificationsService.create({
          userId: student.id,
          title: 'Upcoming Live Session',
          message: `Your live session "${session.title}" for ${session.course.title} is starting soon!`,
          type: NotificationType.REMINDER,
          metadata: {
            sessionId: session.id,
            courseId: session.course_id,
            startTime: session.start_time,
            meetingLink: session.meeting_link,
          },
        });

        // Email notification
        await this.mailService.sendLiveSessionReminder(
          student.email,
          student.firstName,
          session.course.title,
          session.title,
          session.meeting_link,
          session.start_time,
        ).catch(err => {
          this.logger.error(`Failed to send email to ${student.email}: ${err.message}`);
        });
      }

      // Mark as notified
      session.notification_sent = true;
      await this.liveSessionRepository.save(session);
    }
  }
}
