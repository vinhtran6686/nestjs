import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  //get PORT from .env
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}
}
