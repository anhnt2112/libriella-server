import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb://${configService.get<string>('database.mongoUser')}:${configService.get<string>('database.mongoPassword')}@${configService.get<string>('database.mongoHost')}:${configService.get<string>('database.mongoPort')}/${configService.get<string>('database.mongoDatabase')}?authSource=admin`,
      }),
    }),
  ],
  providers: [DatabaseService, RedisService],
  exports: [RedisService],
})
export class DatabaseModule {}
