import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractToken(client);

    if (!token) {
      throw new UnauthorizedException('Authentication token missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      // Assign the user to the socket object so we can access it in handlers
      client['user'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid authentication token');
    }
  }

  private extractToken(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
    
    // Fallback to query param if needed (useful for some clients)
    if (client.handshake.query.token) {
      return client.handshake.query.token as string;
    }

    return undefined;
  }
}
