import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private readonly prefix: string;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.prefix = this.configService.get('REDIS_PREFIX', 'app');
  }

  async onModuleInit() {
    await this.checkConnection();
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(this.getKey(key), value, ttl);
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error.stack);
      throw error;
    }
  }

  async get(key: string): Promise<any> {
    try {
      return await this.cacheManager.get(this.getKey(key));
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error.stack);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(this.getKey(key));
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error.stack);
      throw error;
    }
  }

  private async checkConnection() {
    try {
      await this.set('health_check', 'ok', 10);
      const result = await this.get('health_check');
      if (result === 'ok') {
        this.logger.log('Successfully connected to Redis');
      }
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error.stack);
      throw error;
    }
  }
}
