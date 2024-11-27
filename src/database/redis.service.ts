import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private isConnected = false;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('database.redisHost'),
      port: this.configService.get<number>('database.redisPort'),
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log('Connected to Redis successfully!');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      this.logger.error('Redis connection error:', error);
    });
  }

  async createSession(userId: string) {
    const sessionId = `session_${randomUUID()}`;
    const currentSession = await this.getSession(sessionId);
    if (!currentSession) await this.client.set(sessionId, userId, 'EX', 60 * 60);
    return { sessionId };
  }

  async getSession(sessionId: string) {
    const userId = await this.client.get(sessionId);
    return userId;
  }

  async deleteSession(sessionId: string) {
    await this.client.del(sessionId);
  }
}
