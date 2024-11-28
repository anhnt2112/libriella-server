import {
  Body,
  Controller,
  HttpStatus,
  Res,
  Get,
  UseGuards,
  Req,
  Param,
  Post
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Body() body, @Res() res, @Req() req) {
    try {
      const user = await this.userService.getUserById(
        req.user.id as unknown as string,
      );
      return res.status(HttpStatus.OK).send(user);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Get('profile-by-username/:username')
  async getProfileByUsername(@Res() res, @Req() req, @Param('username') username: string) {
    try {
      const data = await this.userService.getUserByUsername(username);
      return res.status(HttpStatus.OK).send(data)
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  } 

  @Post('follow/:username')
  @UseGuards(AuthGuard)
  async followUser(@Param('username') username: string, @Req() req, @Res() res) {
    try {
      await this.userService.followUser(username, req.user.id);
      return res.status(HttpStatus.OK).send({ message: "Follow successfully" });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }
}
