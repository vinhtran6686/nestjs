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
import { RedisOptions, redisStore } from 'cache-manager-redis-store';

@Module({
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    MailService,
    TokenBlacklistGuard,
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
    CacheModule.registerAsync<RedisOptions>({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const config = {
          store: redisStore,
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          ttl: configService.get('REDIS_TTL'),
          retryStrategy: (times: number) => {
            // Retry connection up to 5 times
            if (times >= 5) {
              throw new Error('Redis connection failed after 5 attempts');
            }
            return Math.min(times * 100, 3000);
          },
          onClientReady: (client) => {
            client.on('error', (err) =>
              console.error('Redis Client Error:', err),
            );
            client.on('connect', () => console.log('Redis Client Connected'));
          },
        };

        return config;
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, MailService, TokenBlacklistGuard],
})
export class AuthModule {}
