import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from 'src/schemas/user.schema';
import path from 'path';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notificationService: NotificationService
  ) {}

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
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) throw new UnauthorizedException('Invalid user');
    return user;
  }

  async getUserByUsername(username: string) {
    const user = await this.userModel.findOne({ username }).select('-password').exec();
    if (!user) throw new UnauthorizedException('Invalid user');
    return user;
  }

  async getConnections(userId: string) {
    const user = await this.getUserById(userId);
    if (!user) throw new UnauthorizedException('Invalid user');

    const userFullConnections = await this.userModel.findById(userId).select("followers following").exec();

    const followersDetails = await Promise.all(
      userFullConnections.followers.map((followerId) => 
        this.userModel.findById(followerId).select('-password')
      )
    );

    const followingDetails = await Promise.all(
      userFullConnections.following.map((followingId) => 
        this.userModel.findById(followingId).select('-password')
      )
    );

    return {
      followers: followersDetails,
      following: followingDetails
    };
  }

  async followUser(followingId: string, followerId: string) {
    await this.userModel.findByIdAndUpdate(followingId, {
      $addToSet: { followers: followerId },
    });

    await this.userModel.findByIdAndUpdate(followerId, {
      $addToSet: { following: followingId },
    });

    await this.notificationService.createNotification({
      userId: followingId,
      isPost: false,
      isComment: false,
      postId: null,
      creatorId: followerId
    });

    return { success: true };
  }

  async unfollowUser(followerId: string, followingId: string) {
    await this.userModel.findByIdAndUpdate(followingId, {
      $pull: { followers: followerId }, 
    });
  
    await this.userModel.findByIdAndUpdate(followerId, {
      $pull: { following: followingId }, 
    });
  
    return { success: true };
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

  async searchByUsername(searchText: string) {
    return this.userModel
      .find({ username: { $regex: searchText, $options: 'i' } })
      .select('username fullName avatar followers')
      .exec();
  }

  async getUnfollowedUsers(userId: string): Promise<User[]> {
    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new Error('User not found');
    }

    // Get list of users not followed by the current user
    const unfollowedUsers = await this.userModel
      .find({
        _id: { $ne: userId, $nin: user.following }, // Exclude the user and their following list
      })
      .limit(5)
      .lean();

    return unfollowedUsers;
  }
}
