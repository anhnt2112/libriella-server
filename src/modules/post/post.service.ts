import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from 'src/schemas/post.schema';
import { UserService } from '../user/user.service';
import { Comment } from 'src/schemas/comment.schema';
import { RedisService } from 'src/database/redis.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly activityService: ActivityService,
  ) {}

  async createNote(userId, content) {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new UnauthorizedException('Invalid user');
    await this.activityService.createActivity(userId, { type: 7 });
    return this.redisService.createNote(userId, content);
  }

  async getNote(userId) {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new UnauthorizedException('Invalid user');
    return this.redisService.getNotes([userId]);
  }

  async getFollowingNote(userId) {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new UnauthorizedException('Invalid user');
    const notes = await this.redisService.getNotes(
      user.following.map((id) => id.toString()),
    );
    const notesWithUserInfo = await Promise.all(
      notes.map(async (note) => {
        const item = await this.userService.getUserById(note.userId);
        return {
          user: item,
          content: note.content,
          timestamp: note.timestamp,
        };
      }),
    );

    return notesWithUserInfo;
  }

  async createPost(post: any) {
    const user = await this.userService.getUserById(post.userId);
    if (!user) throw new UnauthorizedException('Invalid user');
    const newPost = new this.postModel({
      ...post,
      author: post.userId,
      tags: post.tags.split(','),
    });
    await this.activityService.createActivity(post.userId, {
      type: 0,
      post: newPost._id.toString(),
    });
    return newPost.save();
  }

  async getPostByPostId(postId: string) {
    return this.postModel
      .findById(postId)
      .populate('author', 'username avatar')
      .exec();
  }

  async getUserPosts(
    userId: string,
    isFavorite: boolean,
    skip: number,
    limit: number,
  ) {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new UnauthorizedException('Invalid user');
    const posts = await this.postModel
      .find({ isFavorite, author: userId, isDeleted: false })
      .skip(skip)
      .limit(limit)
      .exec();
    return posts;
  }

  async getPreviewPosts(userId: string) {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new UnauthorizedException('Invalid user');
    const posts = await this.postModel
      .find({ author: userId, isDeleted: false })
      .skip(0)
      .limit(3)
      .exec();
    const postCount = await this.postModel
      .find({ author: userId, isDeleted: false })
      .countDocuments();
    return {
      count: postCount,
      previewImage: posts.map((post) => ({
        id: post._id,
        image: post.image,
      })),
    };
  }

  async getFollowingPosts(userId: string, skip: number, limit: number) {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new UnauthorizedException('Invalid user');
    const followingIds = user.following;
    const posts = await this.postModel
      .find({ author: { $in: followingIds }, isDeleted: false })
      .populate('author', '-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return posts;
  }

  async getExplorePosts(userId: string, skip: number, limit: number) {
    /// need more: user not see: owner posts, folowing posts, reacted and commented posts
    const user = await this.userService.getUserById(userId);
    if (!user) throw new UnauthorizedException('Invalid user');
    const posts = await this.postModel
      .find({ author: { $nin: [userId, ...user.following] }, isDeleted: false })
      .skip(skip)
      .limit(limit)
      .exec();
    return posts;
  }

  async updatePostReact(postId: string, content, isDelete = false) {
    const post = await this.postModel.findById(postId).exec();
    if (!post) throw new UnauthorizedException('Invalid post');
    const value = isDelete ? -1 : 1;
    if (content) post.comments += value;
    else post.likes += value;
    return post.save();
  }

  async searchByBookName(searchText: string) {
    return this.postModel
      .find({
        bookName: { $regex: searchText, $options: 'i' },
        isDeleted: false,
      })
      .populate('author', 'username')
      .exec();
  }

  async updatePost(postId: string, updateData, userId) {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new UnauthorizedException('Invalid user');

    const post = await this.postModel.findById(postId).exec();
    if (!post) {
      throw new NotFoundException(`Post with ID "${postId}" not found`);
    }

    if (post.author.toString() !== userId) {
      throw new UnauthorizedException(
        'You are not allowed to update this post',
      );
    }

    console.log(updateData);

    const updatedPost = await this.postModel.findByIdAndUpdate(postId, {
      $set: {
        description: updateData.description || post.description,
        bookName: updateData.bookName || post.bookName,
        linkToBuy: updateData.linkToBuy || post.linkToBuy,
        isFavorite: updateData.isFavorite,
        tags: updateData.tags || post.tags,
        isDeleted: !!updateData.isDeleted,
      },
    });

    console.log(updateData.isDeleted);

    if (updateData.isDeleted) {
      await this.activityService.createActivity(userId, {
        type: 2,
        post: postId,
      });
    } else {
      await this.activityService.createActivity(userId, {
        type: 1,
        post: postId,
      });
    }
    return updatedPost;
  }
}
