import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import * as E from 'fp-ts/Either';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Topic } from '@prisma/client';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get(':alias')
  @UseGuards(JwtAuthGuard)
  async getUrlAnalytics(@Param('alias') alias: string) {
    const analytics = await this.analyticsService.getUrlAnalytics(alias);
    if (E.isLeft(analytics)) {
      return { error: analytics.left.message, statusCode: analytics.left.statusCode };
    }
    return analytics.right;
  }

  @Get('topic/:topic')
  @UseGuards(JwtAuthGuard)
  async getTopicAnalytics(@Param('topic') topic: Topic) {
    return await this.analyticsService.getTopicAnalytics(topic);
  }

  @Get('overall/all')
  async getOverallAnalytics(@Req() req) {
    const analytics = await this.analyticsService.getOverallAnalytics();
    if (E.isLeft(analytics)) {
      return { error: analytics.left.message, statusCode: analytics.left.statusCode };
    }
    return analytics.right;
  }
}