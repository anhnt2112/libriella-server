import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Activity } from 'src/schemas/activity.schema';
import { UserService } from '../user/user.service';
import { Model } from 'mongoose';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name)
    private readonly activityModel: Model<Activity>,
    private readonly userService: UserService,
  ) {}

  async createActivity(userId: string, body: any) {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    const activity = new this.activityModel({ author: userId, ...body });
    return activity.save();
  }

  async getActivitiesByUserId(userId: string) {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return this.activityModel
      .find({ author: userId })
      .populate('user', 'username avatar')
      .populate('post', 'post image bookName')
      .populate('comment', 'content comment')
      .exec();
  }
}
