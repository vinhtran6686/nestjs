import { UrlBuilderService } from '@/shared/services/url-builder.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// src/auth/mail.service.ts
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly urlBuilder: UrlBuilderService,
  ) {}

  async sendVerificationEmail(email: string, token: string) {
    try {
      const verificationUrl = this.urlBuilder.buildAuthUrl('verify-email', {
        token,
      });

      const context = {
        verificationUrl,
        appName: this.configService.get<string>('APP_NAME', 'NestJS App'),
      };

      this.logger.debug(`Sending email with context:`, context);

      await this.mailerService.sendMail({
        to: email,
        from: this.configService.get('MAIL_FROM'),
        subject: 'Verify Your Email',
        template: 'verification-email',
        context,
      });

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}`,
        error.stack,
      );
      throw new Error('Failed to send verification email');
    }
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const resetUrl = this.urlBuilder.buildClientUrl('/reset-password');

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Your Password',
      template: 'reset-password',
      context: {
        resetUrl,
        token,
        supportEmail: this.configService.get('SUPPORT_EMAIL'),
      },
    });

    this.logger.log(`Reset password email sent to ${email}`);
  }
}
