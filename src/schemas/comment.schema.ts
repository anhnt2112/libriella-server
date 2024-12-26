import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";
import { User } from "./user.schema";

class CommentComment {
    @Prop({ type: Types.ObjectId, ref: 'Comment', required: true })
    commentId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    author: Types.ObjectId;

    @Prop({ type: String })
    content: string;
}

@Schema({ timestamps: true })
export class Comment extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
    postId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    author: User;

    @Prop({ type: [CommentComment], default: [] })
    comments: CommentComment[];

    @Prop({ type: String })
    content: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);