import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Comment } from "src/schemas/comment.schema";
import { UserService } from "../user/user.service";
import { PostService } from "./post.service";
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comment.name) private commentModel: Model<Comment>,
        private readonly userService: UserService,
        private readonly postService: PostService,
        private readonly notificationService: NotificationService
    ) {}

    async reactPost(postId: string, userId: string, content) {
        const user = await this.userService.getUserById(userId);
        const post = await this.postService.getPostByPostId(postId);

        if (!user) throw new UnauthorizedException('Invalid user');
        if (!post) throw new ConflictException('Invalid post');

        const newElement = new this.commentModel({
            author: userId,
            postId: postId,
            content
        });
        await this.postService.updatePostReact(postId, content, false);
        await this.notificationService.createNotification({
            userId: post.author._id.toString(),
            postId,
            commentId: null,
            creatorId: userId
        });
        return newElement.save();
    }

    async unlikePost(postId: string, userId: string) {
        const user = await this.userService.getUserById(userId);
        const post = await this.postService.getPostByPostId(postId);

        if (!user) throw new UnauthorizedException('Invalid user');
        if (!post) throw new ConflictException('Invalid post');

        await this.postService.updatePostReact(postId, null, true);
        return this.commentModel.deleteOne({
            postId,
            author: userId,
            content: null
        }).exec();
    }

    async hasLikedPost(postId: string, username: string) {
        const user = await this.userService.getUserByUsername(username);
        const post = await this.postService.getPostByPostId(postId);

        if (!user) throw new UnauthorizedException('Invalid user');
        if (!post) throw new ConflictException('Invalid post');

        const like = await this.commentModel.findOne({
            postId: postId,
            content: null
        }).populate({
            path: 'author',
            match: { username }
        }).exec();

        return !!like;
    }

    async getAllLike(postId: string) {
        const post = await this.postService.getPostByPostId(postId);

        if (!post) throw new ConflictException('Invalid post');

        return this.commentModel.find({
            postId,
            content: null
        }).populate({
            path: 'author',
            select: 'username fullName avatar'
        }).exec();
    }

    async getAllComment(postId: string) {
        const post = await this.postService.getPostByPostId(postId);

        if (!post) throw new ConflictException('Invalid post');

        return this.commentModel.find({
            postId,
            content: { $ne: null }
        }).populate({
            path: 'author',
            select: 'username fullName avatar'
        }).sort({ createdAt: -1 }).exec();
    }

    async reactComment(postId: string, commentId: string, userId: string, content) {
        const user = await this.userService.getUserById(userId);
        const post = await this.postService.getPostByPostId(postId);

        if (!user) throw new UnauthorizedException('Invalid user');
        if (!post) throw new ConflictException('Invalid post');

        const newElement = new this.commentModel({
            author: userId,
            postId: postId,
            commentId: commentId,
            content
        });
        await this.postService.updatePostReact(postId, content, false);
        await this.notificationService.createNotification({
            userId: post.author._id.toString(),
            postId,
            commentId,
            creatorId: userId
        });
        return newElement.save();
    } 
}