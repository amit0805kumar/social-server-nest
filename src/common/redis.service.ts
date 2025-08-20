// src/redis/redis.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async setCache(key: string, value: string, ttlInSeconds = 3600): Promise<void> {
    try {
      console.log(`Setting cache for key: ${key} with TTL: ${ttlInSeconds} seconds`);
      await this.redisClient.set(key, value, 'EX', ttlInSeconds);
    } catch (error) {
      this.logger.error(`Failed to set cache for key ${key}: ${error.message}`);
    }
  }

  async getCache(key: string): Promise<string | null> {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      this.logger.error(`Failed to get cache for key ${key}: ${error.message}`);
      return null;
    }
  }

  async delCache(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete cache for key ${key}: ${error.message}`);
    }
  }

  async delCacheByPrefix(prefix: string): Promise<void> {
  const keys = await this.redisClient.keys(`${prefix}*`);
  if (keys.length > 0) {
    await this.redisClient.del(...keys);
  }
}
}
