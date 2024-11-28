import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  content: string;
}

const CommentSchema = SchemaFactory.createForClass(Comment);

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

  @Prop({ type: [String], default: [] })
  reacts: string[];

  @Prop({ type: [CommentSchema], default: [] })
  comments: Comment[];

  @Prop({ required: true })
  username: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
