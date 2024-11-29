import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { MessageService } from './message.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @UseGuards(AuthGuard)
  async sendMessage(
    @Body('conversationId') conversationId: string,
    @Body('content') content: string,
    @Req() req
  ) {
    return this.messageService.sendMessage(conversationId, req.user.id, content);
  }

  @Get(':conversationId')
  async getMessages(@Param('conversationId') conversationId: string) {
    return this.messageService.getMessages(conversationId);
  }
}
