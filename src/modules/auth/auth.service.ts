import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { RedisService } from 'src/database/redis.service';
import { UserService } from '../user/user.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  async validateFacebookUser(facebookId) {
    const user = await this.userService.findByFacebookId(facebookId);
    if (!user) return null;
    const session = await this.redisService.createSession(user._id as string);
    return {
      sessionId: session.sessionId
    };
  }

  async validateGoogleUser(googleId) {
    const user = await this.userService.findByGoogleId(googleId);
    if (!user) return null;
    const session = await this.redisService.createSession(user._id as string);
    return {
      sessionId: session.sessionId
    };
  }

  async register(
    body
  ) {
    const user = await this.userService.createUser(body);
    const session = await this.redisService.createSession(user._id as string);
    return {
      isRecovery: user.recovery,
      sessionId: session.sessionId
    };
  }

  async login(username: string, password: string) {
    const user = await this.userService.findByUsername(username);
    if (
      !user ||
      !(await this.userService.validatePassword(password, user.password))
    ) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const session = await this.redisService.createSession(user._id as string);
    return {
      isRecovery: user.recovery,
      sessionId: session.sessionId
    };
  }

  async resetPasswordByCode(username: string, code: string) {
    const user = await this.userService.findByUsername(username);
    if (!user || code !== user.recovery) {
      throw new UnauthorizedException('Invalid username or wrong code');
    }

    const session = await this.redisService.createSession(user._id as string);
    return {
      sessionId: session.sessionId
    };
  }

  async sendMailReset(username: string) {
    const user = await this.userService.findByUsername(username);
    console.log(user);
    if (!user || !user.email) {
      throw new UnauthorizedException('Invalid username or email');
    }

    const session = await this.redisService.createSession(user._id as string);
    const link = `http://localhost:9001/new-password?sessionId=${session.sessionId}`;
    return this.mailService.sendUserRegistrationMail(user.email, link);
  }

  async getConfig(path) {
    // ForgotPasswordOptions: "forgot-password-options",
    // AnswerQuestion: "answer-question",
    // UseGoogleAccount: "use-google-account",
    // NewPassword: "new-password"
    return path;
  }
}
