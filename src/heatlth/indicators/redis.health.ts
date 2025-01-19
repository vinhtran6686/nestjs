import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { HealthIndicator as CustomHealthIndicator } from '../interfaces/health-indicator.interface';

@Injectable()
export class RedisHealthIndicator
  extends HealthIndicator
  implements CustomHealthIndicator
{
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    super();
  }

  getName(): string {
    return 'redis';
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await this.cacheManager.set('health-check', 'ok', 100);
      const result = await this.cacheManager.get('health-check');

      return this.getStatus(this.getName(), result === 'ok', {
        responseTime: '100ms',
      });
    } catch (error) {
      return this.getStatus(this.getName(), false, {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }
}
