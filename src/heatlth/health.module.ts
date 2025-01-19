import { Module, CacheModule } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './indicators/redis.health';
import { SharedModule } from '@/shared/modules/shared.module';

@Module({
  imports: [TerminusModule, SharedModule, CacheModule.register()],
  controllers: [HealthController],
  providers: [RedisHealthIndicator],
})
export class HealthModule {}
