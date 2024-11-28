import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from 'src/schemas/post.schema';
import { UserService } from '../user/user.service';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>, private readonly userService: UserService) {}

  async createPost(post: any) {
    const user = await this.userService.getUserById(post.userId);
    if (!user) throw new UnauthorizedException('Invalid user');
    const newPost = new this.postModel({
      ...post,
      username: user.username
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
}
