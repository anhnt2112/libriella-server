import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createConversation(@Body('receiver') receiver: string, @Req() req) {
    return this.conversationService.findOrCreateConversation(receiver, req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getConversations(@Req() req) {
    return this.conversationService.getConversations(req.user.id);
  }
}
