import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TokenBlacklistGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = this.extractTokenFromHeader(request);
    console.log('accessToken', accessToken);
    if (!accessToken) {
      return true;
    }

    // Check if token is in blacklist
    const isBlacklisted = await this.authService.isTokenInBlacklist(
      accessToken,
      'access',
    );
    console.log('isBlacklisted', isBlacklisted);

    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
