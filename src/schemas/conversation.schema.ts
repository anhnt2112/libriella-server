import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ type: [Types.ObjectId], ref: 'User', required: true })
  participants: Types.ObjectId[];

  @Prop({ default: null })
  lastMessage: string;

  @Prop({ default: Date.now })
  lastUpdated: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
