import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './modules/auth/auth.guard';
import { PostModule } from './modules/post/post.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ChatModule } from './modules/conversation/conversation.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ActivityModule } from './modules/activity/activity.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads', 'images'),
      serveRoot: '/uploads/images',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    NotificationModule,
    UserModule,
    AuthModule,
    PostModule,
    ChatModule,
    ActivityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
