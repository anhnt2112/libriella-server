import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Activity, ActivitySchema } from 'src/schemas/activity.schema';
import { UserModule } from '../user/user.module';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Activity.name,
        schema: ActivitySchema,
      },
    ]),
    UserModule,
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
