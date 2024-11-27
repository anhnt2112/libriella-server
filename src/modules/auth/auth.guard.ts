import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { RedisService } from 'src/database/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.headers['session-id'];

    if (!sessionId) {
      throw new UnauthorizedException('Session ID is required');
    }

    // Verify session ID in Redis
    const userId = await this.redisService.getSession(sessionId);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // Attach userId to request for later use
    request.user = { id: userId };
    return true; // Allow access
  }
}
