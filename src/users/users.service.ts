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

  findAll() {
    return this.userModel.find();
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
