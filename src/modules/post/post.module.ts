import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from 'src/schemas/post.schema';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { UserModule } from '../user/user.module';
import { Comment, CommentSchema } from 'src/schemas/comment.schema';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { NotificationModule } from '../notification/notification.module';
import { DatabaseModule } from 'src/database/database.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    NotificationModule,
    UserModule,
    ActivityModule,
  ],
  controllers: [PostController, CommentController],
  providers: [PostService, CommentService],
  exports: [PostService, CommentService],
})
export class PostModule {}
