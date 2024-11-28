import {
  Body,
  Controller,
  HttpStatus,
  Res,
  Get,
  UseGuards,
  Req,
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
}
