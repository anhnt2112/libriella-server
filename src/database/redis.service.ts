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
    if (!currentSession) await this.client.set(sessionId, userId, 'EX', 30 * 24 *  60 * 60);
    return { sessionId };
  }

  async createNote(userId: string, content: string) {
    const noteId = `note_${userId}`;
    const exists = await this.client.exists(noteId);
    if (exists) await this.deleteSession(noteId);
    const noteData = JSON.stringify({ userId, content, timestamp: Date.now() });
    return this.client.set(noteId, noteData, 'EX', 24 * 60 * 60);
  }

  async getNotes(userIds: string[]) {
    const keys = userIds.map((userId) => `note_${userId}`);
    if (!keys.length) return [];
    const notes = await this.client.mget(...keys);

    return notes.map((note, index) => (note ? { userId: userIds[index], ...JSON.parse(note) } : null)).filter((note) => note !== null);
  }

  async getSession(sessionId: string) {
    const userId = await this.client.get(sessionId);
    return userId;
  }

  async deleteSession(sessionId: string) {
    await this.client.del(sessionId);
  }
}
