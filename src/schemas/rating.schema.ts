import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";
import { Post } from "./post.schema";
import { User } from "./user.schema";

@Schema()
export class Rating extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
    post: Post;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    author: User;

    @Prop({ type: Number })
    rate: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);