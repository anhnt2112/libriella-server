import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ type: [String], required: true })
  participants: string[];

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  avatar: string;

  @Prop({ default: null })
  lastMessage: string;

  @Prop({ default: null })
  lastSender: string;

  @Prop({ default: Date.now })
  lastUpdated: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
