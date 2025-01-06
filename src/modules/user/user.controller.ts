import {
  Body,
  Controller,
  HttpStatus,
  Res,
  Get,
  UseGuards,
  Req,
  Param,
  Post,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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

  @Post('profile')
  @UseGuards(AuthGuard)
  async updateProfile(@Body() body, @Res() res, @Req() req) {
    try {
      await this.userService.updateUser(
        body,
        req.user.id as unknown as string,
      );
      return res.status(HttpStatus.OK).send({ message: "OK" });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Get('explore')
  @UseGuards(AuthGuard)
  async explore(@Body() body, @Res() res, @Req() req) {
    try {
      const users = await this.userService.getUnfollowedUsers(
        req.user.id as unknown as string,
      );
      return res.status(HttpStatus.OK).send({ explore: users });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Get('connections/:userID')
  async getConnections(@Res() res, @Param('userID') userID: string) {
    try {
      const data = await this.userService.getConnections(userID);
      return res.status(HttpStatus.OK).send(data);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Get('profile-by-username/:username')
  async getProfileByUsername(
    @Res() res,
    @Req() req,
    @Param('username') username: string,
  ) {
    try {
      const data = await this.userService.getUserByUsername(username);
      return res.status(HttpStatus.OK).send(data);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Get('profile-by-user-id/:userId')
  async getProfileByUserID(
    @Res() res,
    @Req() req,
    @Param('userId') userId: string,
  ) {
    try {
      const data = await this.userService.getUserById(userId);
      return res.status(HttpStatus.OK).send(data);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Get('search')
  async search(
    @Query('username') username: string,
    @Res() res,
  ) {
    try {
      const data = await this.userService.searchByUsername(username);
      return res.status(HttpStatus.OK).send(data);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Post('follow/:userID')
  @UseGuards(AuthGuard)
  async followUser(
    @Param('userID') userID: string,
    @Req() req,
    @Res() res,
  ) {
    try {
      await this.userService.followUser(userID, req.user.id);
      return res.status(HttpStatus.OK).send({ message: 'Follow successfully' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Post('unfollow/:userID')
  @UseGuards(AuthGuard)
  async unFollowUser(
    @Param('userID') userID: string,
    @Req() req,
    @Res() res,
  ) {
    try {
      await this.userService.unfollowUser(userID, req.user.id);
      return res
        .status(HttpStatus.OK)
        .send({ message: 'Unfollow successfully' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Post('update-avatar')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Invalid file type'), false);
        }
        cb(null, true);
      },
    }),
  )
  async updateAvatar(
    @Res() res,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const imageUrl = `/uploads/images/${file.filename}`;
      await this.userService.updateAvatar(req.user.id, imageUrl);
      return res
        .status(HttpStatus.CREATED)
        .send({ message: 'Update avatar successfully' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Post('remove-avatar')
  @UseGuards(AuthGuard)
  async removeAvatar(@Req() req, @Res() res) {
    try {
      await this.userService.removeAvatar(req.user.id);
      return res
        .status(HttpStatus.OK)
        .send({ message: 'Remove avatar successfully' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }
}
