import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

export type UserDocument = HydratedDocument<User>;
export type UserModel = SoftDeleteModel<UserDocument>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  phone: string;

  @Prop()
  age: number;

  @Prop()
  address: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  verificationToken: string;

  @Prop()
  refreshToken: string;

  @Prop()
  lastLogin: Date;

  @Prop()
  resetPasswordToken: string;

  @Prop()
  resetPasswordExpires: Date;

  @Prop()
  isPasswordChanged: boolean;

  @Prop({ type: Object })
  company: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
