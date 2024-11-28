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

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);
