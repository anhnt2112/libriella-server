import { MailerModule } from "@nestjs-modules/mailer";
import { Global, Module } from "@nestjs/common";
import { MailService } from "./mail.service";

@Global()
@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: "anh.nt211202@gmail.com",
                    pass: "iqka zqnn nbmd ajrq",
                },
            },
            defaults: {
                from: '"No Reply" <no-reply@example.com',
            },

        })
    ],
    providers: [MailService],
    exports: [MailService]
})
export class MailModule {};
