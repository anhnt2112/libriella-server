import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from 'src/schemas/comment.schema';
import { UserService } from '../user/user.service';
import { PostService } from './post.service';
import { NotificationService } from '../notification/notification.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly notificationService: NotificationService,
    private readonly activityService: ActivityService,
  ) {}

  async reactPost(postId: string, userId: string, content) {
    const user = await this.userService.getUserById(userId);
    const post = await this.postService.getPostByPostId(postId);

    if (!user) throw new UnauthorizedException('Invalid user');
    if (!post) throw new ConflictException('Invalid post');

    const newElement = new this.commentModel({
      author: userId,
      postId: postId,
      content,
    });

    if (content) {
      await this.activityService.createActivity(userId, {
        type: 3,
        post: postId,
        comment: newElement._id.toString(),
      });
    } else {
      await this.activityService.createActivity(userId, {
        type: 4,
        post: postId,
      });
    }

    await this.postService.updatePostReact(postId, content, false);
    if (post.author._id.toString() !== userId) {
      await this.notificationService.createNotification({
        userId: post.author._id.toString(),
        postId,
        commentId: !content ? null : newElement._id.toString(),
        creatorId: userId,
      });
    }
    return newElement.save();
  }

  async unlikePost(postId: string, userId: string) {
    const user = await this.userService.getUserById(userId);
    const post = await this.postService.getPostByPostId(postId);

    if (!user) throw new UnauthorizedException('Invalid user');
    if (!post) throw new ConflictException('Invalid post');

    await this.activityService.createActivity(userId, {
      type: 13,
      post: postId,
    });

    await this.postService.updatePostReact(postId, null, true);
    return this.commentModel
      .deleteOne({
        postId,
        author: userId,
        content: null,
      })
      .exec();
  }

  async unlikeComment(postId: string, commentId: string, userId: string) {
    const user = await this.userService.getUserById(userId);
    const post = await this.postService.getPostByPostId(postId);

    if (!user) throw new UnauthorizedException('Invalid user');
    if (!post) throw new ConflictException('Invalid post');

    await this.activityService.createActivity(userId, {
      type: 14,
      post: postId,
      comment: commentId,
    });

    return this.commentModel
      .deleteOne({
        postId,
        author: userId,
        comment: commentId,
        content: null,
      })
      .exec();
  }

  async hasLikedPost(postId: string, username: string) {
    const user = await this.userService.getUserByUsername(username);
    const post = await this.postService.getPostByPostId(postId);

    if (!user) throw new UnauthorizedException('Invalid user');
    if (!post) throw new ConflictException('Invalid post');

    const like = await this.commentModel
      .findOne({
        postId: postId,
        author: user._id.toString(),
        comment: null,
        content: null,
      })
      .exec();

    return !!like;
  }

  async getAllLike(postId: string) {
    const post = await this.postService.getPostByPostId(postId);

    if (!post) throw new ConflictException('Invalid post');

    return this.commentModel
      .find({
        postId,
        content: null,
      })
      .populate({
        path: 'author',
        select: 'username fullName avatar',
      })
      .exec();
  }

  async getAllComment(postId: string) {
    const post = await this.postService.getPostByPostId(postId);

    if (!post) throw new ConflictException('Invalid post');

    return this.commentModel
      .find({
        postId,
      })
      .populate({
        path: 'author',
        select: 'username fullName avatar',
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async reactComment(
    postId: string,
    commentId: string,
    userId: string,
    content,
  ) {
    const user = await this.userService.getUserById(userId);
    const post = await this.postService.getPostByPostId(postId);

    if (!user) throw new UnauthorizedException('Invalid user');
    if (!post) throw new ConflictException('Invalid post');

    const newElement = new this.commentModel({
      author: userId,
      postId: postId,
      comment: commentId,
      content,
    });

    if (content) {
      await this.activityService.createActivity(userId, {
        type: 5,
        post: postId,
        comment: newElement._id.toString(),
      });
    } else {
      await this.activityService.createActivity(userId, {
        type: 6,
        post: postId,
        comment: newElement._id.toString(),
      });
    }

    if (post.author._id.toString() !== userId) {
      await this.notificationService.createNotification({
        userId: post.author._id.toString(),
        postId,
        commentId: newElement._id.toString(),
        creatorId: userId,
      });
    }
    return newElement.save();
  }
}
