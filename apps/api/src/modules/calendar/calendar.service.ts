import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { InnovationMilestone } from '../innovations/entities/innovation-milestone.entity';
import { LiveSession } from '../live-sessions/entities/live-session.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Course } from '../courses/entities/course.entity';
import { CalendarEventDto } from './dto/calendar-event.dto';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(InnovationMilestone)
    private milestoneRepository: Repository<InnovationMilestone>,
    @InjectRepository(LiveSession)
    private liveSessionRepository: Repository<LiveSession>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async getEvents(userId: string): Promise<CalendarEventDto[]> {
    // 1. Fetch Innovation Milestones
    const milestones = await this.milestoneRepository
      .createQueryBuilder('milestone')
      .leftJoinAndSelect('milestone.innovation', 'innovation')
      .leftJoinAndSelect('innovation.members', 'member')
      .where('innovation.student_id = :userId', { userId })
      .orWhere('member.user_id = :userId', { userId })
      .andWhere('milestone.due_date IS NOT NULL')
      .getMany();

    const milestoneEvents: CalendarEventDto[] = milestones.map(milestone => ({
      id: milestone.id,
      title: `Milestone: ${milestone.title}`,
      description: milestone.description,
      start: milestone.due_date,
      end: milestone.due_date,
      allDay: true,
      type: 'milestone',
      status: milestone.status,
      metadata: {
        innovationId: milestone.innovation_id,
        innovationTitle: milestone.innovation?.title,
      },
    }));

    // 2. Fetch Live Sessions (via Enrollments or Instructor)
    const enrollments = await this.enrollmentRepository.find({
      where: { user: { id: userId } },
      relations: ['course'],
    });
    const enrolledCourseIds = enrollments
      .filter(e => e.course)
      .map(e => e.course.id);

    const taughtCourses = await this.courseRepository.find({
      where: { created_by: userId },
      select: ['id'],
    });
    const taughtCourseIds = taughtCourses.map(c => c.id);

    const allCourseIds = [...new Set([...enrolledCourseIds, ...taughtCourseIds])];

    let sessionEvents: CalendarEventDto[] = [];

    if (allCourseIds.length > 0) {
      const sessions = await this.liveSessionRepository.find({
        where: { course_id: In(allCourseIds) },
        relations: ['course'],
      });

      sessionEvents = sessions.map(session => ({
        id: session.id,
        title: `Live Session: ${session.title}`,
        description: session.description,
        start: session.start_time,
        end: session.end_time,
        allDay: false,
        type: 'live-session',
        status: session.status,
        metadata: {
          courseId: session.course_id,
          courseTitle: session.course?.title,
          platform: session.platform,
          meetingLink: session.meeting_link,
        },
      }));
    }

    // 3. Merge and Sort
    return [...milestoneEvents, ...sessionEvents].sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    );
  }
}
