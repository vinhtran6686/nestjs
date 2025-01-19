import { HealthIndicatorResult } from '@nestjs/terminus';

export interface HealthIndicator {
  isHealthy(): Promise<HealthIndicatorResult>;
  getName(): string;
}
