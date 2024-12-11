// message.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversation: Types.ObjectId;

  @Prop({ type: 'string', required: true })
  sender: string;

  @Prop({ type: 'string' })
  senderAvatar: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  readedBy: string[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
