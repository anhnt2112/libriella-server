import { Controller, Post, Body, Res, HttpStatus, Get, Req, UseGuards, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthGuard as CustomAuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body, @Res() res) {
    const { username, password } = body;
    try {
      await this.authService.register(username, password);
      return res.status(HttpStatus.CREATED).send({ message: 'User registered successfully' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Post('login')
  async login(@Body() body, @Res() res) {
    const { username, password } = body;
    try {
      const sessionId = await this.authService.login(username, password);
      return res.status(HttpStatus.OK).send({ sessionId });
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
  async googleLoginRedirect(@Req() req) {
    return {
      message: 'User information from Google',
      user: req.user,
    };
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin() {
    return { message: 'Redirecting to Facebook login...' };
  }

  @Get('facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginRedirect(@Req() req) {
    return {
      message: 'User information from Facebook',
      user: req.user,
    };
  }

  @Get('config')
  @UseGuards(CustomAuthGuard)
  async getConfig(@Query('path') path: string) {
    return this.authService.getConfig(path);
  }
}
