import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Notification } from "src/schemas/notification.schema";

@Injectable()
export class NotificationService {
    constructor(@InjectModel(Notification.name) private notificationModel: Model<Notification>) {}

    async createNotification(noti: {
        userId: string,
        isPost: boolean,
        isComment: boolean,
        postId: string,
        creatorId: string
    }) {
        const notification = new this.notificationModel(noti);
        return notification.save(); 
    }

    async getNotificationByUserId(userId: string) {
        return this.notificationModel.find({ userId }).sort({ createdAt: -1 }).populate({
            path: 'creatorId',
            select: 'username avatar'
        }).populate({
            path: 'postId',
            select: 'image'
        }).exec();
    }
}