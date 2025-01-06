import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop()
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop()
  avatar: string;

  @Prop()
  facebookId: string;

  @Prop()
  googleId: string;

  @Prop()
  email: string;

  @Prop()
  recovery: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  followers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [], ref: 'User' })
  following: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
