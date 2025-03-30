import { Module, CacheModule, CacheStore } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { UrlBuilderService } from '../services/url-builder.service';
import { RedisService } from '../services/redis.service';
import { MockRedisService } from '../services/mock-redis.service';

@Module({
  imports: [
    // CacheModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => {
    //     const store = await redisStore({
    //       socket: {
    //         host: configService.get<string>('REDIS_HOST'),
    //         port: configService.get<number>('REDIS_PORT'),
    //       },
    //       ttl: configService.get<number>('REDIS_TTL'),
    //     });
    // 
    //     return {
    //       store: store as unknown as CacheStore,
    //     };
    //   },
    //   inject: [ConfigService],
    //   isGlobal: true,
    // }),
  ],
  providers: [
    UrlBuilderService,
    {
      provide: RedisService,
      useFactory: (configService: ConfigService) => {
        return configService.get('REDIS_ENABLED') === 'true' ? RedisService : MockRedisService;
      },
      inject: [ConfigService],
    },
  ],
  exports: [UrlBuilderService, RedisService],
})
export class SharedModule {}
