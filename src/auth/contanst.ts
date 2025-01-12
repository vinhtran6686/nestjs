import { ConfigService } from '@nestjs/config';

export const jwtConstants = (configService: ConfigService) => ({
  accessToken: {
    secret: configService.get<string>('JWT_ACCESS_TOKEN'),
    expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
  },
  refreshToken: {
    secret: configService.get<string>('JWT_REFRESH_TOKEN'),
    expiresIn: configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
  },
});
