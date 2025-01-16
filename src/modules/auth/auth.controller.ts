import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Get,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthGuard as CustomAuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body, @Res() res) {
    try {
      const { sessionId, isRecovery } = await this.authService.register(body);
      return res
        .status(HttpStatus.OK)
        .send({ sessionId, isRecovery });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body, @Res() res) {
    try {
      const {sessionId} = await this.authService.resetPasswordByCode(body.username, body.code);
      return res.status(HttpStatus.OK).send({ sessionId });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() body, @Res() res) {
    try {
      await this.authService.sendMailReset(body.username);
      return res.status(HttpStatus.OK).send({ message: "OK" });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Post('login')
  async login(@Body() body, @Res() res) {
    const { username, password } = body;
    try {
      const { sessionId, isRecovery } = await this.authService.login(username, password);
      return res.status(HttpStatus.OK).send({ sessionId, isRecovery: !!isRecovery })
    } catch (error) { 
      return res.status(HttpStatus.UNAUTHORIZED).send({ error: error.message });
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    return { message: 'Redirecting to Google login...' };
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleLoginRedirect(@Req() req, @Res() res) {
    const session = await this.authService.validateGoogleUser(req.user.id);
    const frontendUrl = session ? `http://localhost:9001/session?sessionId=${session.sessionId}` : `http://localhost:9001/information?googleId=${req.user.id}&email=${req.user.email}`;
    return res.redirect(frontendUrl);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin() {
    return { message: 'Redirecting to Facebook login...' };
  }

  @Get('facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginRedirect(@Req() req, @Res() res) {
    const session = await this.authService.validateFacebookUser(req.user.facebookId);
    const frontendUrl = session ? `http://localhost:9001/session?sessionId=${session.sessionId}` : `http://localhost:9001/information?facebookId=${req.user.facebookId}&email=${req.user.emails}`;
    return res.redirect(frontendUrl);
  }

  @Get('config')
  @UseGuards(CustomAuthGuard)
  async getConfig(@Query('path') path: string) {
    return this.authService.getConfig(path);
  }
}
