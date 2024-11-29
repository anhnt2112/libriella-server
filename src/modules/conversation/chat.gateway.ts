import { WebSocketGateway, SubscribeMessage, OnGatewayInit, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor(private readonly messageService: MessageService) {}

  afterInit(server: Server) {
    console.log('WebSocket Initialized');
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: any) {
    const { conversationId, senderId, content } = payload;
    const message = await this.messageService.sendMessage(conversationId, senderId, content);

    this.server.to(conversationId).emit('receiveMessage', message);
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(client: Socket, conversationId: string) {
    client.join(conversationId);
    console.log(`Client ${client.id} joined conversation ${conversationId}`);
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(client: Socket, conversationId: string) {
    client.leave(conversationId);
    console.log(`Client ${client.id} left conversation ${conversationId}`);
  }
}
