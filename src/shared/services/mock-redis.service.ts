import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MockRedisService {
  private readonly logger = new Logger('MockRedisService');
  private readonly prefix: string;

  constructor(private configService: ConfigService) {
    this.prefix = this.configService.get('REDIS_PREFIX', 'app');
    this.logger.warn('Using MockRedisService - Redis is disabled');
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.logger.debug(`Mock set: ${key}`);
  }

  async get(key: string): Promise<any> {
    this.logger.debug(`Mock get: ${key}`);
    return null;
  }

  async del(key: string): Promise<void> {
    this.logger.debug(`Mock del: ${key}`);
  }
} 