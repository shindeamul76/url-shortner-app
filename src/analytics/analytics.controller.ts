import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import * as E from 'fp-ts/Either';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Topic } from '@prisma/client';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}
  
  /**
   * Retrieves overall analytics data.
  *
  * @param req - The request object.
  * @returns An object containing either the analytics data or an error message with a status code.
  * @throws Will throw an error if the analytics data cannot be retrieved.
  */
    @Get('overall')
    @UseGuards(JwtAuthGuard)
    async getOverallAnalytics(@Req() req) {
      const userId = req.user.id;
      const analytics = await this.analyticsService.getOverallAnalytics(userId);
      if (E.isLeft(analytics)) {
        return { error: analytics.left.message, statusCode: analytics.left.statusCode };
      }
      return analytics.right;
    }



    /**
     * Retrieves the analytics data for a given URL alias.
    *
    * @param alias - The alias of the URL for which analytics data is to be retrieved.
    * @returns An object containing either the analytics data or an error message with a status code.
    */
  @Get(':alias')
  @UseGuards(JwtAuthGuard)
  async getUrlAnalytics(@Param('alias') alias: string) {
    const analytics = await this.analyticsService.getUrlAnalytics(alias);
    if (E.isLeft(analytics)) {
      return { error: analytics.left.message, statusCode: analytics.left.statusCode };
    }
    return analytics.right;
  }



  /**
   * Retrieves analytics data for a specific topic.
   * 
   * @param topic - The topic for which analytics data is to be retrieved.
   * @returns A promise that resolves to the analytics data for the specified topic.
  */
  @Get('topic/:topic')
  @UseGuards(JwtAuthGuard)
  async getTopicAnalytics(@Param('topic') topic: Topic) {
    return await this.analyticsService.getTopicAnalytics(topic);
  }
}