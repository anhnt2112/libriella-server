import { WebSocketGateway, SubscribeMessage, OnGatewayInit, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor(private readonly messageService: MessageService) {}

  private loggers= new Map<String, Logger>();

  afterInit(server: Server) {
    console.log('Chat WebSocket Initialized');
  }

  private getLogger(conversationId: string): Logger {
    if (!this.loggers.has(conversationId)) {
      this.loggers.set(conversationId, new Logger(`Conversation-${conversationId}`));
    }
    return this.loggers.get(conversationId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, conversationId: string) {
    this.server.to(conversationId).emit('receiveMessage');
    const logger = this.getLogger(conversationId);
    logger.log(`Message sent from ${client.id}`);
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(client: Socket, conversationId: string) {
    client.join(conversationId);
    const logger = this.getLogger(conversationId);
    logger.log(`Client ${client.id} joined conversation.`);
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(client: Socket, conversationId: string) {
    client.leave(conversationId);
    const logger = this.getLogger(conversationId);
    logger.log(`Client ${client.id} left conversation.`);
  }
}
