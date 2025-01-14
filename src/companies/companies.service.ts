import {
  BadRequestException,
  Injectable,
  Logger,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyModel } from './schemas/company.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Company } from './schemas/company.schema';
import aqp from 'api-query-params';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { IUser } from '@/users/users.interface';
import { PAGINATION_CONSTANTS } from '@/constants/pagination.constant';
import {
  PaginationParams,
  PaginatedResult,
} from '@/shared/interfaces/pagination.interface';
import { TimeoutError } from 'rxjs';
import { validateSort, sanitizeQuery } from '@/shared/utils/query.util';
import { validatePaginationParams } from '@/shared/utils/validation.util';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    @InjectModel(Company.name) private companyModel: CompanyModel,
    private readonly usersService: UsersService,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, user: IUser) {
    const company = new this.companyModel({
      ...createCompanyDto,
      createdBy: { _id: user._id, email: user.email },
    });
    return company.save();
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<Company>> {
    try {
      // Validate all input parameters
      const validation = validatePaginationParams(params);
      if (!validation.isValid) {
        throw new BadRequestException(validation.errors.join(', '));
      }

      const { page, limit, sort, fields, search } = validation.validatedData!;
      

      // Build query
      const query = this.companyModel.find({ isDeleted: false });

      // Apply search if provided
      if (search) {
        query.where('name', new RegExp(search, 'i'));
      }

      // Apply field selection if provided
      if (fields) {
        query.select(fields.split(',').join(' '));
      }

      // Apply pagination
      const skip = (page - 1) * limit;
      query.skip(skip).limit(limit);

      // Apply sorting
      const [sortField, sortOrder] = sort.split(':');
      query.sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 });

      // Execute query with timeout
      const result = (await Promise.race([
        Promise.all([
          query.exec(),
          this.companyModel.countDocuments({ isDeleted: false }),
        ]),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new TimeoutError()),
            PAGINATION_CONSTANTS.TIMEOUT_MS,
          ),
        ),
      ])) as [Company[], number];

      const [results, total] = result;

      return {
        data: results,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(
        `Error fetching companies: ${error.message}`,
        error.stack,
      );

      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException('Query took too long to execute');
      }

      throw error;
    }
  }

  async findDeleted() {
    return this.companyModel.find({ isDeleted: true });
  }

  async findOne(id: string) {
    if (!id) {
      throw new NotFoundException('Company not found');
    }

    const company = await this.companyModel.findById(id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    if (!id) {
      throw new NotFoundException('Company not found');
    }

    const company = await this.companyModel
      .findByIdAndUpdate(id, {
        ...updateCompanyDto,
        updatedBy: { _id: user._id, email: user.email },
      })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async remove(id: string, user: IUser) {
    if (!id) {
      throw new NotFoundException('Company not found');
    }

    // soft delete
    const company = await this.companyModel.findByIdAndUpdate(id, {
      deletedBy: { _id: user._id, email: user.email },
      deletedAt: new Date(),
      isDeleted: true,
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return { message: 'Company deleted successfully' };
  }

  async restore(id: string, user: IUser) {
    if (!id) {
      throw new NotFoundException('Company not found');
    }

    const company = await this.companyModel.findByIdAndUpdate(id, {
      deletedBy: null,
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }
}
