import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Rating } from "src/schemas/rating.schema";
import { UserService } from "../user/user.service";
import { PostService } from "./post.service";

@Injectable()
export class RatingService {
    constructor(
        @InjectModel(Rating.name) private ratingModel: Model<Rating>,
        private readonly userService: UserService,
        private readonly postService: PostService
    ) {}

    async createOrUpdateRate(postId: string, userId: string, rate: number) {
        const user = await this.userService.getUserById(userId);
        const post = await this.postService.getPostByPostId(postId);
    
        if (!user) throw new UnauthorizedException('Invalid user');
        if (!post) throw new ConflictException('Invalid post');
    
        const existingRating = await this.ratingModel.findOne({ author: user._id, post: post._id });
    
        if (existingRating) {
            const previousRate = existingRating.rate;
            existingRating.rate = rate;

            const totalRate = post.average * post.rate - previousRate + rate;
            post.average = totalRate / post.rate;
    
            await existingRating.save();
        } else {
            const newRating = new this.ratingModel({
                author: user,
                post,
                rate
            });
    
            const currentRate = post.rate;
            const currentAverage = post.average;
    
            post.average = currentAverage ? (currentAverage * currentRate + rate) / (currentRate + 1) : rate;
            post.rate = currentRate + 1;
    
            await newRating.save();
        }
    
        return post.save();
    }

    async getRatingByPost(postId: string) {
        const post = await this.postService.getPostByPostId(postId);
        if (!post) throw new ConflictException('Invalid post');

        const ratings = await this.ratingModel.find({ post: new Types.ObjectId(postId) }).exec();

        return ratings;
    }
}