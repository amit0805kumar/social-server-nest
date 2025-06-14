import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UUID } from 'crypto';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true }) // auto handles createdAt and updatedAt
export class User {

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ default: true })
  isActive?: boolean;

  @Prop({ default: false })
  isAdmin?: boolean;

  @Prop()
  lastLogin?: Date;

  @Prop()
  profilePicture?: string;

  @Prop()
  coverPicture?: string;

  @Prop()
  description?: string;

  @Prop()
  phoneNumber?: string;

  @Prop()
  city?: string;

  @Prop()
  relationshipStatus?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop({ default: [] })
  following?: UUID[];

  @Prop({ default: [] })
  followers?: UUID[];
}

export const UserSchema = SchemaFactory.createForClass(User);
