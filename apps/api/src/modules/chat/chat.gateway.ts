import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all for now
  },
  namespace: 'chat',
})
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection() {
    // console.log('Client connected:', client.id);
  }

  handleDisconnect() {
    // console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() conversationId: string) {
    // TODO: Verify if user belongs to conversation
    client.join(conversationId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; content: string },
  ) {
    // User is attached to client by WsJwtGuard
    const user = client['user'];
    const senderId = user.sub;

    const message = await this.chatService.sendMessage(
      payload.conversationId,
      senderId,
      payload.content,
    );
    
    // Broadcast to room
    this.server.to(payload.conversationId).emit('newMessage', message);
  }
}
