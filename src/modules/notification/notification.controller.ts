import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { AuthGuard } from "../auth/auth.guard";

@Controller('Notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    @UseGuards(AuthGuard)
    async getNotification(@Res() res, @Req() req) {
        try {
            const notification = await this.notificationService.getNotificationByUserId(req.user.id);
            return res.status(HttpStatus.OK).send(notification);
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
        }
    }

    @Post()
    async createNotification(@Res() res, @Req() req, @Body() body: any) {
        try {
            const notification = await this.notificationService.createNotification(body);
            return res.status(HttpStatus.OK).send({ message: "OK" });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
        }
    }
}