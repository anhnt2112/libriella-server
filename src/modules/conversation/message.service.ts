// message.service.ts
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from 'src/schemas/message.schema';
import { UserService } from '../user/user.service';
import { Conversation } from 'src/schemas/conversation.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
    private readonly userService: UserService,
  ) {}

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const sender = await this.userService.getUserById(senderId);
    if (!sender) throw new UnauthorizedException('Invalid user');
    const message = await this.messageModel.create({
      conversation: conversationId,
      sender: sender.username,
      senderAvatar: sender.avatar,
      content,
      readedBy: [sender.username],
    });

    await this.conversationModel.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: content,
        lastSender: sender.username
      },
      {
        new: true
      }
    );

    return message;
  }

  async getMessages(conversationId: string) {
    return this.messageModel
      .find({ conversation: conversationId })
      .populate('sender')
      .sort({ createdAt: 1 });
  }
}
