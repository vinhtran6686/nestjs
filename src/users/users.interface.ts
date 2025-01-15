import { ObjectId } from 'mongoose';

export interface IUser {
  _id: string | ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  age?: number;
  address?: string;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  isEmailVerified?: boolean;
  verificationToken?: string;
  refreshToken?: string;
  lastLogin?: Date;
  role?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isPasswordChanged?: boolean;
  company?: {
    _id: string | ObjectId;
    name: string;
  };
}
