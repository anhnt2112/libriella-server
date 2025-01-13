import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getActivitiesByUserId(@Req() req) {
    try {
      return await this.activityService.getActivitiesByUserId(req.user.id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
