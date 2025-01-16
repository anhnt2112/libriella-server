import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) {}

    async sendUserRegistrationMail(to: string, link: string) {
        await this.mailerService.sendMail({
            to,
            subject: 'Reset password link',
            text: link
        });
    }
}