import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { Public } from './shared/decorators/auth.decorator';

@Controller()
export class AppController {
  //get PORT from .env
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  // test api 
  @Get('test')
  @Public()
  test() {
    return this.appService.getHello();
  }
}
