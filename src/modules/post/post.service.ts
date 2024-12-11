import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from 'src/schemas/post.schema';
import { UserService } from '../user/user.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private readonly userService: UserService,
  ) {}

  async createPost(post: any) {
    const user = await this.userService.getUserById(post.userId);
    if (!user) throw new UnauthorizedException('Invalid user');
    const newPost = new this.postModel({
      ...post,
      username: user.username,
    });
    return newPost.save();
  }

  async getUserPosts(
    username: string,
    isFavorite: boolean,
    skip: number,
    limit: number,
  ) {
    const user = await this.userService.findByUsername(username);
    if (!user) throw new UnauthorizedException('Invalid user');
    const posts = await this.postModel
      .find({ username, isFavorite: isFavorite })
      .skip(skip)
      .limit(limit)
      .exec();
    return posts;
  }

  async getPreviePosts(username: string) {
    const user = await this.userService.findByUsername(username);
    if (!user) throw new UnauthorizedException('Invalid user');
    const posts = await this.postModel
      .find({ username, isFavorite: false })
      .skip(0)
      .limit(3)
      .exec();
    const postCount = await this.postModel.find({ username }).countDocuments();
    return {
      count: postCount,
      previewImage: posts.map((post) => ({
        id: post._id,
        image: post.image,
      })),
    };
  }

  async getExplorePosts(userId: string, skip: number, limit: number) {
    /// need more: user not see: owner posts, folowing posts, reacted and commented posts
    const user = await this.userService.getUserById(userId);
    if (!user) throw new UnauthorizedException('Invalid user');
    const posts = await this.postModel
      .find({ username: { $ne: user.username } })
      .skip(skip)
      .limit(limit)
      .exec();
    return posts;
  }

  async reactPost(postId: string, userId: string) {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new UnauthorizedException('Invalid user');
    const post = await this.postModel.findById(postId).exec();
    if (!post) throw new UnauthorizedException('Invalid post');
    post.reacts.push(user.username);
    return post.save();
  }

  async commentPost(postId: string, userId: string, content: string) {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new UnauthorizedException('Invalid user');
    const post = await this.postModel.findById(postId).exec();
    if (!post) throw new UnauthorizedException('Invalid post');
    post.comments.push({ username: user.username, content });
    return post.save();
  }
}
