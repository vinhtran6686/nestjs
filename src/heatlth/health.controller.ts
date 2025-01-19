import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { RedisHealthIndicator } from './indicators/redis.health';
import { Public } from '@/shared/decorators/auth.decorator';
import { RedisService } from '../shared/services/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private redisHealth: RedisHealthIndicator,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    return this.health.check([() => this.redisHealth.isHealthy()]);
  }
}
