import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

// Post group
// Dang bai 0 (done)
// Cap nhat bai 1 (done)
// Xoa bai 2 (done)
// Binh luan bai 3 v
// Thich bai 4 v
// Tra loi cmt 5 v
// Thich cmt 6 v
// Huy thich bai 13 v
// Huy thich comment 14 v
// Dang note 7 (done)

// Message group
// Nhan tin 10

// Account group
// Cap nhat thong tin ca nhan 11
// Cap nhat cai dat ca nhan 12

@Schema({ timestamps: true })
export class Activity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Post' })
  post: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Comment' })
  comment: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Conversation' })
  conversation: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Message' })
  message: Types.ObjectId;
  @Prop({ type: Number, required: true })
  type: string;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
