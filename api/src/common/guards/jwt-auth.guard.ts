import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { CurrentUserPayload } from '../decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request & { user?: CurrentUserPayload }>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token de acesso ausente.');
    }

    try {
      request.user = await this.jwtService.verifyAsync<CurrentUserPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET') ?? 'ecodescarte-dev-secret',
      });

      return true;
    } catch {
      throw new UnauthorizedException('Sessao invalida ou expirada.');
    }
  }

  private extractToken(request: Request) {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
