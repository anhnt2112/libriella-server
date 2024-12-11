// conversation.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from 'src/schemas/conversation.schema';
import { UserService } from '../user/user.service';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
    private readonly userService: UserService
  ) {}

  async findOrCreateConversation(receiver: string, senderId: string) {
    const user1 = await this.userService.getUserByUsername(receiver);
    const user2 = await this.userService.getUserById(senderId);
    if (!user1 || !user2) throw new UnauthorizedException('Invalid user');
    let conversation = await this.conversationModel.findOne({
      participants: { $all: [user1.username, user2.username] },
    });

    if (!conversation) {
      conversation = await this.conversationModel.create({
        participants: [user1.username, user2.username],
        name: user1.fullName,
        avatar: user1.avatar,
      });
    }

    return conversation;
  }

  async getConversations(userId: string) {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new UnauthorizedException('Invalid user');
    return this.conversationModel.find({
      participants: { $in: [user.username] }
    }).exec();
  }
}
