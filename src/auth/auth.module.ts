import { CacheModule, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { LocalStrategy } from './passport/local.stagegy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './contanst';
import { JwtStrategy } from './passport/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import ms from 'ms';
import { AuthController } from './auth.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { AUTH_MESSAGES } from '@/constants/message/auth.constant';
import { MailService } from './mail/mail.service';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { getMailConfig } from '@/config/mailer.config';
import { SharedModule } from '@/shared/modules/shared.module';
import { TokenBlacklistGuard } from './token-blacklist.guard';
import { RedisService } from '@/shared/services/redis.service';

@Module({
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    MailService,
    TokenBlacklistGuard,
    RedisService,
  ],
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: jwtConstants(configService).accessToken.secret,
        signOptions: {
          expiresIn: ms(jwtConstants(configService).accessToken.expiresIn),
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: config.get('THROTTLE_TTL'),
            limit: config.get('THROTTLE_LIMIT'),
          },
        ],
        errorMessage: AUTH_MESSAGES.ERRORS.RATE_LIMIT_EXCEEDED,
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const templateDir = join(__dirname, '../../views');
        console.log('Template directory:', templateDir);
        return {
          ...getMailConfig(configService),
          template: {
            dir: templateDir,
            adapter: new EjsAdapter(),
            options: {
              strict: false,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    SharedModule,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    JwtModule,
    MailService,
    TokenBlacklistGuard,
    RedisService,
  ],
})
export class AuthModule {}
