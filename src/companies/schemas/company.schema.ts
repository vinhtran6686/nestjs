import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User } from '@/users/schemas/user.schema'; // Đảm bảo đường dẫn đến User schema chính xác

export type CompanyDocument = HydratedDocument<Company>;
export type CompanyModel = SoftDeleteModel<CompanyDocument>;

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true })
  name: string;

  @Prop()
  address: string;

  @Prop()
  description: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: User.name })
  createdBy: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name })
  updatedBy: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name })
  deletedBy: User | Types.ObjectId;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
