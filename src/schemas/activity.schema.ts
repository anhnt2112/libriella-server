import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

// Post group (Post, Comment, Like)
// Dang bai 0 (done) post with pen icon
// Cap nhat bai 1 (done) post with pen icon
// Xoa bai 2 (done) post with delete icon
// Binh luan bai 3 v comment with comment icon
// Thich bai 4 v like with filled like icon
// Tra loi cmt 5 v comment with comment icon
// Thich cmt 6 v like with filled like icon
// Huy thich bai 13 v unlike with like icon
// Huy thich comment 14 v unlike with like icon
// Dang note 7 (done) note with pen icon

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
