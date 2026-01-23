import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST') || 'smtp.ethereal.email',
      port: this.configService.get<number>('MAIL_PORT') || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('MAIL_USER') || 'ethereal.user@ethereal.email',
        pass: this.configService.get<string>('MAIL_PASSWORD') || 'ethereal_password',
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const from = this.configService.get<string>('MAIL_FROM') || '"EduFlow" <noreply@eduflow.com>';
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error('Error sending email', error);
      throw error;
    }
  }

  async sendLiveSessionReminder(to: string, userName: string, courseTitle: string, sessionTitle: string, meetingLink: string, startTime: Date) {
    const subject = `Reminder: Live Session for ${courseTitle} is starting soon`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${userName},</h2>
        <p>This is a reminder that your live session <strong>"${sessionTitle}"</strong> for the course <strong>${courseTitle}</strong> is starting in 15 minutes.</p>
        <p><strong>Start Time:</strong> ${startTime.toLocaleString()}</p>
        <p>
          <a href="${meetingLink}" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Join Session
          </a>
        </p>
        <p>Or copy this link: ${meetingLink}</p>
        <p>See you there!</p>
        <p>The EduFlow Team</p>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }

  async sendMentorshipRequestEmail(to: string, mentorName: string, menteeName: string) {
    const subject = `New Mentorship Request from ${menteeName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${mentorName},</h2>
        <p>You have received a new mentorship request from <strong>${menteeName}</strong>.</p>
        <p>Please log in to your dashboard to review and respond to this request.</p>
        <p>
          <a href="${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/dashboard/mentorship" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Request
          </a>
        </p>
        <p>The EduFlow Team</p>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }

  async sendMentorshipSessionBookedEmail(to: string, userName: string, otherPartyName: string, startTime: Date, meetingLink: string) {
    const subject = `Mentorship Session Confirmed with ${otherPartyName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${userName},</h2>
        <p>Your mentorship session with <strong>${otherPartyName}</strong> has been confirmed.</p>
        <p><strong>Date & Time:</strong> ${startTime.toLocaleString()}</p>
        <p>
          <a href="${meetingLink}" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Join Meeting
          </a>
        </p>
        <p>Or copy this link: ${meetingLink}</p>
        <p>See you there!</p>
        <p>The EduFlow Team</p>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }

  async sendMentorshipRequestStatusEmail(to: string, menteeName: string, mentorName: string, status: string) {
    const subject = `Mentorship Request ${status}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${menteeName},</h2>
        <p>Your mentorship request to <strong>${mentorName}</strong> has been <strong>${status.toLowerCase()}</strong>.</p>
        <p>Please log in to your dashboard for more details.</p>
        <p>The EduFlow Team</p>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }
}
