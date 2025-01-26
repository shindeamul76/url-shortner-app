import { Controller, Get, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import * as E from 'fp-ts/Either';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Topic } from '@prisma/client';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

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
  async getOverallAnalytics(@Req() req, @Res() res: Response) {
    const userId = req.user.id;
    const analytics = await this.analyticsService.getOverallAnalytics(userId);
  
    if (E.isLeft(analytics)) {
      return res
        .status(analytics.left.statusCode) 
        .json({ error: analytics.left.message });
    }
  
    return res.status(StatusCodes.OK).json(analytics.right); 
  }



    /**
     * Retrieves the analytics data for a given URL alias.
    *
    * @param alias - The alias of the URL for which analytics data is to be retrieved.
    * @returns An object containing either the analytics data or an error message with a status code.
    */
    @Get(':alias')
    @UseGuards(JwtAuthGuard)
    async getUrlAnalytics(@Param('alias') alias: string, @Res() res: Response) {
      const analytics = await this.analyticsService.getUrlAnalytics(alias);
      console.log(analytics, "analytics");
    
      if (E.isLeft(analytics)) {
        return res
          .status(analytics.left.statusCode) 
          .json({ error: analytics.left.message });
      }
    
      return res.status(StatusCodes.OK).json(analytics.right); 
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