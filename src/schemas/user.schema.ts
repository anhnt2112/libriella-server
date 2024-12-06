import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop()
  avatar: string;

  @Prop({ type: [String], default: [] })
  followers: string[];

  @Prop({ type: [String], default: [] })
  following: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
