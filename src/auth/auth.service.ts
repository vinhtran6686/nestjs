import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
  // CACHE_MANAGER,
  Logger,
} from '@nestjs/common';
// import { Cache } from 'cache-manager';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from '@/users/users.interface';
import { ConfigService } from '@nestjs/config';
import { TokensDto } from './dto/token.dto';
import { RegisterDto } from './dto/register.dto';
import { AUTH_MESSAGES } from '@/constants/message/auth.constant';
import { MailService } from './mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import ms from 'ms';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    // @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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

  async login(user: IUser, res: any) {
    const tokens = await this.generateTokens(user);

    // set cookie
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge:
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN')) / 1000,
      path: '/api/auth/refresh',
    });

    return {
      ...tokens,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async logout(userId: string, accessToken: string, res: any): Promise<void> {
    try {
      // 1. Get refresh token from DB
      const user = await this.usersService.findOne(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const refreshToken = user?.refreshToken;

      // 2. Remove refresh token from DB
      await this.usersService.update(userId, {
        refreshToken: null,
        lastLogin: new Date(),
      });

      // 3. Remove refresh token cookie
      res.cookie('refresh_token', '', {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        expires: new Date(0),
        path: '/api/auth/refresh',
        sameSite: 'strict',
      });

      // 4. Add access token and refresh token to blacklist
      await Promise.all([
        this.addToTokenBlacklist(accessToken, 'access'),
        refreshToken && this.addToTokenBlacklist(refreshToken, 'refresh'),
      ]);
    } catch (error) {
      throw new InternalServerErrorException('Logout failed');
    }
  }

  private async addToTokenBlacklist(
    token: string,
    type: 'access' | 'refresh',
  ): Promise<void> {
    try {
      if (!token) return;

      // Decode token to get expiration time
      const decoded = this.jwtService.decode(token);
      if (!decoded || !decoded['exp']) {
        return;
      }

      // Calculate remaining time of the token
      const ttl = decoded['exp'] - Math.floor(Date.now() / 1000);

      if (ttl > 0) {
        // Add prefix to distinguish token type
        const prefix = type === 'access' ? 'bl_acc_' : 'bl_ref_';
        // await this.cacheManager.set(`${prefix}${token}`, 'true', ttl * 1000);
        this.logger.debug(`Token added to blacklist: ${type}, TTL: ${ttl}s`);
      }
    } catch (error) {
      this.logger.error(
        `Error adding ${type} token to blacklist:`,
        error.stack,
      );
      throw new InternalServerErrorException('Error blacklisting token');
    }
  }

  // Method to check if token is in blacklist
  async isTokenInBlacklist(
    token: string,
    type: 'access' | 'refresh',
  ): Promise<boolean> {
    const prefix = type === 'access' ? 'bl_acc_' : 'bl_ref_';
    // const result = await this.cacheManager.get(`${prefix}${token}`);
    return false;
  }

  async getAccount(user: IUser): Promise<Partial<IUser>> {
    // get account from DB
    const currentUser = await this.usersService.findOne(user._id.toString());
    if (!currentUser) {
      throw new UnauthorizedException('User not found');
    }

    // return the necessary fields inheriting from IUser
    return {
      _id: currentUser._id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      phone: currentUser.phone,
      company: currentUser.company,
    };
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
      name: user.name,
    };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN'),
      expiresIn:
        ms(this.configService.get<string>('JWT_ACCESS_EXPIRES_IN')) / 1000,
    });
  }

  private async generateRefreshToken(user: IUser): Promise<string> {
    const payload = {
      sub: user._id,
      type: 'refresh',
    };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN')) / 1000,
    });
  }

  async refreshTokens(refreshToken: string, res: any) {
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

      // generate new tokens
      const tokens = await this.generateTokens(user);

      // set cookie
      res.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        sameSite: 'strict',
        maxAge:
          ms(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN')) / 1000,
        path: '/api/auth/refresh',
      });
      return tokens;
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
    const user = await this.usersService.register({
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

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    console.log(userId);
    console.log(changePasswordDto);
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValidPassword = await this.usersService.isValidPassword(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedPassword = await this.usersService.hashPassword(
      changePasswordDto.newPassword,
    );
    await this.usersService.update(user._id.toString(), {
      password: hashedPassword,
    });

    return { message: AUTH_MESSAGES.SUCCESS.PASSWORD_CHANGED_SUCCESSFULLY };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findOneByUsername(
      forgotPasswordDto.email,
    );
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = await this.generateResetToken(user);

    // Save hashed reset token to user
    const hashedToken = await this.usersService.hashPassword(resetToken);
    await this.usersService.update(user._id.toString(), {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
    });

    // Send reset password email
    await this.mailService.sendResetPasswordEmail(user.email, resetToken);

    return { message: AUTH_MESSAGES.SUCCESS.RESET_PASSWORD_EMAIL_SENT };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    console.log('resetPasswordDto', resetPasswordDto);
    if (resetPasswordDto.password !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Find user by reset token
    const user = await this.usersService.findOneByResetToken(
      resetPasswordDto.token,
    );
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token is expired
    if (user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Update password and clear reset token
    const hashedPassword = await this.usersService.hashPassword(
      resetPasswordDto.password,
    );
    await this.usersService.update(user._id.toString(), {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return { message: AUTH_MESSAGES.SUCCESS.PASSWORD_RESET_SUCCESSFULLY };
  }

  private async generateResetToken(user: IUser): Promise<string> {
    const payload = { email: user.email, type: 'reset' };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_RESET_SECRET'),
      expiresIn: '1h',
    });
  }

  // async getBlacklistedTokens(prefix: string): Promise<string[]> {
  //   const cacheKeys = await this.cacheManager.store.keys?.(`${prefix}*`);
  //   return cacheKeys || [];
  // }
}
