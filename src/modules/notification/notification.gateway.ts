import { Logger } from "@nestjs/common";
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ namespace: '/notification', cors: { origin: '*' } })
export class NotificationGateway implements OnGatewayInit {
    @WebSocketServer() server: Server;

    private userSockets = new Map<string, string>();

    afterInit(server: any) {
        console.log("Notification WebSocket Initialized");
    }

    @SubscribeMessage('registerUser')
    handleRegisterUser(client: Socket, userId: string): void {
        this.userSockets.set(userId, client.id);
        console.log(`User ${userId} connected with socket ID ${client.id}`);
    }

    @SubscribeMessage('sendNotification')
    async handleSendNotification(client: Socket, userId: string) {
        const targetSocketId = this.userSockets.get(userId);

        if (targetSocketId) {
            this.server.to(targetSocketId).emit('receiveNotification', "New notification");
            console.log(`Notification sent to user ${userId}`);
        } else {
            console.log(`User ${userId} is not connected.`);
        }
    }

    handleDisconnect(client: Socket): void {
        for (const [userId, socketId] of this.userSockets.entries()) {
            if (socketId === client.id) {
                this.userSockets.delete(userId);
                console.log(`User ${userId} disconnected.`);
                break;
            }
        }
    }
}
