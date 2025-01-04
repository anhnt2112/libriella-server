import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";

@Schema({ timestamps: true })
export class Notification extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Post' })
    postId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Comment' })
    commentId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    creatorId: Types.ObjectId;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);