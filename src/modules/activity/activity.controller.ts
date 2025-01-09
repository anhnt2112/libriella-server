import {
  BadRequestException,
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('user/:userId')
  @UseGuards(AuthGuard)
  async getActivitiesByUserId(@Param('userId') userId: string) {
    try {
      return await this.activityService.getActivitiesByUserId(userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
