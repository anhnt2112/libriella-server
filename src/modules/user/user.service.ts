import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(
    username: string,
    password: string,
    fullName: string,
  ): Promise<UserDocument> {
    const findedUser = await this.findByUsername(username);
    if (findedUser) throw new ConflictException('User already exists');
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      username,
      password: hashedPassword,
      fullName,
    });
    return user.save();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new UnauthorizedException('Invalid user');
    return {
      username: user.username,
      followers: user.followers,
      following: user.following,
      avatar: user.avatar,
    };
  }

  async getUserByUsername(username: string) {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) throw new UnauthorizedException('Invalid user');
    return {
      username: user.username,
      followers: user.followers,
      following: user.following,
      fullName: user.fullName,
      avatar: user.avatar,
    };
  }

  async getConnections(username: string) {
    const user = await this.findByUsername(username);
    if (!user) throw new UnauthorizedException('Invalid user');

    const [followers, following] = await Promise.all([
      this.getFollowers(user.followers),
      this.getFollowing(user.following),
    ]);

    return { followers, following };
  }

  private async getFollowers(followers: string[]) {
    return Promise.all(
      followers.map(async (username) => {
        const user = await this.getUserByUsername(username);
        return {
          username: user.username,
          fullName: user.fullName,
          followers: user.followers.length,
          following: user.following.length,
          avatar: user.avatar,
        };
      }),
    );
  }

  private async getFollowing(following: string[]) {
    return Promise.all(
      following.map(async (username) => {
        const user = await this.getUserByUsername(username);
        return {
          username: user.username,
          fullName: user.fullName,
          followers: user.followers.length,
          following: user.following.length,
          avatar: user.avatar,
        };
      }),
    );
  }

  async followUser(username: string, userId: string) {
    const otherUser = await this.findByUsername(username);
    const currentUser = await this.userModel.findById(userId).exec();

    if (!currentUser) {
      throw new UnauthorizedException('Current user not found');
    }
    if (!otherUser) {
      throw new ConflictException('User to follow not found');
    }

    if (!otherUser.followers.includes(currentUser.username)) {
      otherUser.followers.push(currentUser.username);
    }
    if (!currentUser.following.includes(otherUser.username)) {
      currentUser.following.push(otherUser.username);
    }

    await otherUser.save();
    await currentUser.save();
  }

  async unFollowUser(username: string, userId: string) {
    const otherUser = await this.findByUsername(username);
    const currentUser = await this.userModel.findById(userId).exec();

    if (!currentUser) {
      throw new UnauthorizedException('Current user not found');
    }
    if (!otherUser) {
      throw new ConflictException('User to follow not found');
    }

    if (!otherUser.followers.includes(currentUser.username)) {
      throw new ConflictException('Not found relation');
    } else {
      const index = otherUser.followers.indexOf(currentUser.username);
      otherUser.followers.splice(index, 1);
    }

    if (!currentUser.following.includes(otherUser.username)) {
      throw new ConflictException('Not found relation');
    } else {
      const index = currentUser.following.indexOf(otherUser.username);
      currentUser.following.splice(index, 1);
    }

    await otherUser.save();
    await currentUser.save();
  }

  async updateAvatar(userId: string, avatar: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new UnauthorizedException('Invalid user');
    user.avatar = avatar;
    return user.save();
  }

  async removeAvatar(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new UnauthorizedException('Invalid user');
    user.avatar = null;
    return user.save();
  }
}
