import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from 'src/schemas/post.schema';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async createPost(post: Post) {
    const newPost = new this.postModel(post);
    return newPost.save();
  }

  async getPosts(username: string, userId: string, isFavorite: boolean) {
    // return this.postModel.find({ username }).exec();
    return {
      username,
      userId,
    };
  }

  async getUserPosts(
    userId: string,
    isFavorite: boolean,
    skip: number,
    limit: number,
  ) {
    const posts = await this.postModel
      .find({ userId, isFavorite: isFavorite })
      .skip(skip)
      .limit(limit)
      .exec();
    return posts;
  }
}
