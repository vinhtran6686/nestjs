import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModel } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { isValidObjectId } from 'libs/utils';
import { IUser } from './users.interface';
import {
  PaginatedResult,
  PaginationParams,
} from '@/shared/interfaces/pagination.interface';
import { validatePaginationParams } from '@/shared/utils/validation.util';
import { TimeoutError } from 'rxjs';
import { PAGINATION_CONSTANTS } from '@/constants/pagination.constant';
import { RegisterDto } from '@/auth/dto/register.dto';
import { AUTH_MESSAGES } from '@/constants/message/auth.constant';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: UserModel,
  ) {}

  async generatePassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.generatePassword(createUserDto.password);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return createdUser.save();
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await this.generatePassword(registerDto.password);
    const newUser = new this.userModel({
      ...registerDto,
      password: hashedPassword,
    });
    return newUser.save();
  }

  findOneByUsername(username: string) {
    const user = this.userModel.findOne({ email: username });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user as unknown as IUser;
  }

  isValidPassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<User>> {
    // Validate all input parameters
    const validation = validatePaginationParams(params);
    if (!validation.isValid) {
      throw new BadRequestException(validation.errors.join(', '));
    }
    const { page, limit, sort, fields, search } = validation.validatedData!;
    console.log(page, limit, sort, fields, search);

    // Build query
    const query = this.userModel.find({ isDeleted: false });

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
        this.userModel.countDocuments({ isDeleted: false }),
      ]),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new TimeoutError()),
          PAGINATION_CONSTANTS.TIMEOUT_MS,
        ),
      ),
    ])) as [User[], number];

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
  }

  async findAllWithDeleted() {
    return this.userModel.findDeleted();
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user as unknown as IUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true },
    );
    if (!updatedUser) {
      throw new BadRequestException('User not found');
    }
    return updatedUser;
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    await this.userModel.softDelete({ _id: id });

    return { message: 'User soft deleted successfully' };
  }

  async restore(id: string): Promise<IUser> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    await this.userModel.restore({ _id: id });
    return this.findOne(id) as unknown as IUser;
  }

  async findOneByResetToken(resetToken: string) {
    return this.userModel.findOne({ resetPasswordToken: resetToken });
  }
}
