import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/shared/decorators/auth.decorator';
import { TokenBlacklistGuard } from './token-blacklist.guard';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenBlacklistGuard: TokenBlacklistGuard,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If the route is public, return true
    if (isPublic) {
      return true;
    }

    // Check if the token is blacklisted
    const isTokenValid = await this.tokenBlacklistGuard.canActivate(context);
    console.log('isTokenValid', isTokenValid);
    if (!isTokenValid) {
      throw new UnauthorizedException('Token has been revoked');
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
