import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN'),
    });
  }

  async validate(payload: any) {
    console.log('payload', payload);
    // payload contains _id, email, role, name (the fields is defined in the payload when generate access token)
    return {
      _id: payload._id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  }
}
// this strategy is used to validate the jwt token (when the request is made to the protected route)
