// src/config/mailer.config.ts
import { ConfigService } from '@nestjs/config';

export const getMailConfig = (configService: ConfigService) => ({
  transport: {
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: configService.get('SENDGRID_API_KEY'),
    },
  },
  defaults: {
    from: configService.get('MAIL_FROM'),
  },
});
