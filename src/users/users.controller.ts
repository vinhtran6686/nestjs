import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TransformResponse } from '@/shared/decorators/transform.decorator';
import { RESPONSE_TYPES } from '@/constants/message/transform.constant';
import { PaginationParams } from '@/shared/interfaces/pagination.interface';
import { USER_MESSAGES } from '@/constants/message/user.constant';

@Controller('users')
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    console.log('createUserDto: ', createUserDto);
    return this.usersService.create(createUserDto);
  }

  @Get()
  @TransformResponse({
    responseType: RESPONSE_TYPES.PAGINATED,
    message: USER_MESSAGES.LIST.FETCHED,
  })
  findAll(@Query() params: PaginationParams) {
    console.log(params);
    return this.usersService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.usersService.restore(id);
  }

  @Post('with-deleted')
  findAllWithDeleted() {
    return this.usersService.findAllWithDeleted();
  }
}
