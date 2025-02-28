import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('like')
  @UseGuards(AuthGuard)
  async likePost(@Body() body, @Res() res, @Req() req) {
    try {
      if (body.commentId) {
        await this.commentService.reactComment(
          body.postId,
          body.commentId,
          req.user.id,
          null,
        );
      } else {
        await this.commentService.reactPost(body.postId, req.user.id, null);
      }
      return res.status(HttpStatus.OK).send({ message: 'OK' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Post('comment')
  @UseGuards(AuthGuard)
  async commentPost(@Body() body, @Res() res, @Req() req) {
    try {
      if (body.commentId) {
        await this.commentService.reactComment(
          body.postId,
          body.commentId,
          req.user.id,
          body.content,
        );
      } else {
        await this.commentService.reactPost(
          body.postId,
          req.user.id,
          body.content,
        );
      }
      return res.status(HttpStatus.OK).send({ message: 'OK' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Post('unlike')
  @UseGuards(AuthGuard)
  async unlikePost(@Body() body, @Res() res, @Req() req) {
    try {
      if (body.commentId) {
        await this.commentService.unlikeComment(
          body.postId,
          body.commentId,
          req.user.id,
        );
      } else {
        await this.commentService.unlikePost(body.postId, req.user.id);
      }
      return res.status(HttpStatus.OK).send({ message: 'OK' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Get('hasLikedPost')
  async hasLikedPost(
    @Query('postId') postId: string,
    @Query('username') username: string,
    @Res() res,
  ) {
    try {
      const hasLiked = await this.commentService.hasLikedPost(postId, username);
      return res.status(HttpStatus.OK).send({ hasLiked });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Get('comment')
  async getComments(@Query('postId') postId: string, @Res() res) {
    try {
      const all = await this.commentService.getAllComment(postId);
      return res.status(HttpStatus.OK).send({ all });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }
}
