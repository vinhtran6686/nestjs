import {
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Body,
  Query,
  Res,
  UnauthorizedException,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from '../shared/decorators/auth.decorator';
import { AUTH_MESSAGES } from '@/constants/message/auth.constant';
import { UsersService } from '@/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TransformResponse } from '@/shared/decorators/transform.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @TransformResponse({
    message: AUTH_MESSAGES.SUCCESS.LOGGED_IN,
  })
  @Public()
  handleLogin(@Req() req: any, @Res({ passthrough: true }) res: any) { 
    return this.authService.login(req.user, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return req.user;
  }

  @Get('account')
  @UseGuards(JwtAuthGuard)
  getAccount(@Req() req: any) {
    return this.authService.getAccount(req.user);
  }

  @Post('refresh')
  @Public()
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    // check if token is in blacklist
    const isBlacklisted = await this.authService.isTokenInBlacklist(
      refreshToken,
      'refresh',
    );
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked2');
    }
    return this.authService.refreshTokens(refreshToken, res);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
    @Headers('Authorization') authorization: string,
  ) {
    const userId = req.user._id;
    console.log('AuthController:', authorization);
    const accessToken = authorization.split(' ')[1];
    console.log('accessToken', accessToken);
    console.log('userId', userId);
    await this.authService.logout(userId, accessToken, res);
    return { message: AUTH_MESSAGES.SUCCESS.LOGGED_OUT };
  }

  @Post('register')
  @Public()
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('verify-email')
  @Public()
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user._id, changePasswordDto);
  }

  @Post('forgot-password')
  @Public()
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @Public()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('blacklist')
  @Public()
  async getBlacklist(@Query('type') type: 'access' | 'refresh') {
    // const prefix = type === 'access' ? 'bl_acc_' : 'bl_ref_';
    // console.log('prefix', prefix);
    // const keys = await this.authService.getBlacklistedTokens(prefix);
    return { blacklist: [] };
  }
}
