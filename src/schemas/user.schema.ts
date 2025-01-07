import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
class UserSetting {
  @Prop({ default: 0 })
  viewPosts: number;

  @Prop({ default: 0 })
  viewFavorite: number;

  @Prop({ default: 0 })
  receiveMesssage: number;

  @Prop({ default: true })
  followNoti: boolean;

  @Prop({ default: true })
  reactPostNoti: boolean;

  @Prop({ default: true })
  commentPostNoti: boolean;

  @Prop({ default: true })
  reactCommentNoti: boolean;

  @Prop({ default: true })
  replyCommentNoti: boolean;
}

const UserSettingSchema = SchemaFactory.createForClass(UserSetting);

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

  @Prop({ type: UserSettingSchema, default: {
    viewPosts: 0,
    viewFavorite: 0,
    receiveMesssage: 0,
    followNoti: true,
    reactPostNoti: true,
    commentPostNoti: true,
    reactCommentNoti: true,
    replyCommentNoti: true
  }})
  setting: UserSetting;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  followers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [], ref: 'User' })
  following: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
