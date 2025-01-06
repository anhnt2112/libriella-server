import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";
import { User } from "./user.schema";

@Schema({ timestamps: true })
export class Comment extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
    postId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    author: User;

    @Prop({ type: Types.ObjectId, default: null })
    comment: Comment;

    @Prop({ type: String })
    content: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);