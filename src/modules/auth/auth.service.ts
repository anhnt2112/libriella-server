import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { RedisService } from 'src/database/redis.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly userService: UserService,
  ) {}

  async register(
    username: string,
    password: string,
    fullName: string,
  ): Promise<void> {
    await this.userService.createUser(username, password, fullName);
  }

  async login(username: string, password: string): Promise<string> {
    const user = await this.userService.findByUsername(username);
    if (
      !user ||
      !(await this.userService.validatePassword(password, user.password))
    ) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const session = await this.redisService.createSession(user._id as string);
    return session.sessionId;
  }

  async getConfig(path) {
    // ForgotPasswordOptions: "forgot-password-options",
    // AnswerQuestion: "answer-question",
    // UseGoogleAccount: "use-google-account",
    // NewPassword: "new-password"
    return path;
  }
}
