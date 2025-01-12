import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from '@/users/users.interface';
import { ConfigService } from '@nestjs/config';
import { TokensDto } from './dto/token.dto';
import { RegisterDto } from './dto/register.dto';
import { AUTH_MESSAGES } from '@/constants/message/auth.constant';
import { MailService } from './mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isPasswordValid = await this.usersService.isValidPassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is incorrect');
    }
    return user;
  }

  async login(user: IUser) {
    return this.generateTokens(user);
  }

  private async generateTokens(user: IUser): Promise<TokensDto> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
    ]);

    // Save refresh token to DB
    await this.usersService.update(user._id.toString(), {
      refreshToken,
      lastLogin: new Date(),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async generateAccessToken(user: IUser): Promise<string> {
    const payload = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN'),
    });
  }

  private async generateRefreshToken(user: IUser): Promise<string> {
    const payload = {
      sub: user._id,
      type: 'refresh',
    };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });
  }

  async refreshTokens(refreshToken: string) {
    try {
      // verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_TOKEN'),
      });

      // find user by id
      const user = await this.usersService.findOne(payload.sub);
      if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(registerDto: RegisterDto) {
    // Check if email exists
    const existingUser = await this.usersService.findOneByUsername(
      registerDto.email,
    );
    if (existingUser) {
      throw new BadRequestException(AUTH_MESSAGES.ERRORS.EMAIL_EXISTS);
    }

    // Generate verification token
    const verificationToken = await this.generateVerificationToken(
      registerDto.email,
    );

    // Create user with verification token
    const user = await this.usersService.create({
      ...registerDto,
      verificationToken,
      isEmailVerified: false,
    });

    // Send verification email
    await this.mailService.sendVerificationEmail(user.email, verificationToken);

    return {
      message: AUTH_MESSAGES.SUCCESS.REGISTERED,
    };
  }

  private async generateVerificationToken(email: string): Promise<string> {
    const payload = {
      email,
      type: 'email-verification',
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN'),
      expiresIn: '24h',
    });
  }

  async verifyEmail(token: string) {
    try {
      // verify token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_VERIFICATION_TOKEN'),
      });

      // find user by email
      const user = await this.usersService.findOneByUsername(payload.email);
      if (!user || user.verificationToken !== token) {
        throw new BadRequestException(
          AUTH_MESSAGES.ERRORS.INVALID_VERIFICATION_TOKEN,
        );
      }

      // update user
      await this.usersService.update(user._id.toString(), {
        isEmailVerified: true,
        verificationToken: null,
      });

      return {
        message: AUTH_MESSAGES.SUCCESS.EMAIL_VERIFIED,
      };
    } catch (error) {
      throw new BadRequestException(
        AUTH_MESSAGES.ERRORS.INVALID_VERIFICATION_TOKEN,
      );
    }
  }
}
