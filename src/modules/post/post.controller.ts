import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { AuthGuard } from '../auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create')
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
  async createPost(
    @Body() body,
    @Res() res,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const imageUrl = `/uploads/images/${file.filename}`;
      await this.postService.createPost({
        ...body,
        userId: req.user.id,
        image: imageUrl,
      });
      return res
        .status(HttpStatus.CREATED)
        .send({ message: 'Create post successfully' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Get('get-posts-by-username/:username')
  @UseGuards(AuthGuard)
  async getPosts(
    @Res() res,
    @Param('username') username: string,
    @Query() query: any,
    @Req() req,
  ) {
    try {
      const isFavorite = query.isFavorite === 'true';
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const skip = (page - 1) * limit;
      const posts = await this.postService.getUserPosts(
        username,
        isFavorite,
        skip,
        limit,
      );
      return res.status(HttpStatus.OK).send({ posts });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Get('explore')
  @UseGuards(AuthGuard)
  async getExplorePosts(@Res() res, @Req() req, @Query() query: any) {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const skip = (page - 1) * limit;
      const posts = await this.postService.getExplorePosts(
        req.user.id,
        skip,
        limit,
      );
      return res.status(HttpStatus.OK).send({ posts });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Post('react')
  @UseGuards(AuthGuard)
  async reactPost(@Body() body, @Res() res, @Req() req) {
    try {
      await this.postService.reactPost(body.postId, req.user.id);
      return res.status(HttpStatus.OK).send({ message: 'React successfully' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Post('comment')
  @UseGuards(AuthGuard)
  async commentPost(@Body() body, @Res() res, @Req() req) {
    try {
      await this.postService.commentPost(
        body.postId,
        req.user.id,
        body.comment,
      );
      return res
        .status(HttpStatus.OK)
        .send({ message: 'Comment successfully' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Get("preview/:username")
  async getPreviewByUsername(
    @Res() res,
    @Param('username') username: string,
    @Req() req
  ) {
    try {
      const posts = await this.postService.getPreviePosts(username);
      return res
        .status(HttpStatus.OK)
        .send(posts);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }
}
