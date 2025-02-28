import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  image: string;

  @Prop()
  description: string;

  @Prop()
  bookName: string;

  @Prop()
  linkToBuy: string;

  @Prop({ required: true })
  isFavorite: boolean;

  @Prop({ type: Number, default: 0 })
  likes: number;

  @Prop({ type: Number, default: 0 })
  comments: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  rate: number;

  @Prop({ type: Number })
  average: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);
