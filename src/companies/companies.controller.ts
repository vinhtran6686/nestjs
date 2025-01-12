import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { User } from '@/shared/decorators/customize';
import { IUser } from '@/users/users.interface';
import { PaginationParams } from '@/shared/interfaces/pagination.interface';
import { TransformInterceptor } from '@/shared/interceptors';
import { RESPONSE_TYPES } from '@/constants/message/transform.constant';
import { TransformResponse } from '@/shared/decorators/transform.decorator';
import { COMPANY_MESSAGES } from '@/constants/message';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @TransformResponse({
    message: COMPANY_MESSAGES.CREATE.SUCCESS,
  })
  create(@Body() createCompanyDto: CreateCompanyDto, @User() user: IUser) {
    return this.companiesService.create(createCompanyDto, user);
  }

  @Get()
  @TransformResponse({
    responseType: RESPONSE_TYPES.PAGINATED,
    message: COMPANY_MESSAGES.LIST.FETCHED,
  })
  findAll(@Query() query: PaginationParams) {
    return this.companiesService.findAll(query);
  }

  @Get()
  @Version('2')
  @TransformResponse({
    responseType: RESPONSE_TYPES.PAGINATED,
    message: COMPANY_MESSAGES.LIST.FETCHED,
  })
  async findAllV2(@Query() query: PaginationParams) {
    return {
      message: 'This is a test message from v2',
    };
  }

  @Get('deleted')
  findAllWithDeleted() {
    return this.companiesService.findDeleted();
  }

  @Get(':id')
  @TransformResponse({
    message: COMPANY_MESSAGES.DETAIL.FETCHED,
  })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @TransformResponse({
    message: COMPANY_MESSAGES.UPDATE.SUCCESS,
  })
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @User() user: IUser,
  ) {
    return this.companiesService.update(id, updateCompanyDto, user);
  }

  @Delete(':id')
  @TransformResponse({
    message: COMPANY_MESSAGES.DELETE.SUCCESS,
  })
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.companiesService.remove(id, user);
  }

  @Post(':id/restore')
  @TransformResponse({
    message: COMPANY_MESSAGES.RESTORE.SUCCESS,
  })
  restore(@Param('id') id: string, @User() user: IUser) {
    return this.companiesService.restore(id, user);
  }
}
