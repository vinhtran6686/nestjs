import { Module, CacheModule, CacheStore } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { UrlBuilderService } from '../services/url-builder.service';
import { RedisService } from '../services/redis.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
          },
          ttl: configService.get<number>('REDIS_TTL'),
        });

        return {
          store: store as unknown as CacheStore, // Chuyển kiểu để khớp với CacheModuleOptions
        };
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  providers: [UrlBuilderService, RedisService],
  exports: [UrlBuilderService, RedisService, CacheModule],
})
export class SharedModule {}
