import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as E from 'fp-ts/Either';
import { subDays, startOfDay } from 'date-fns';
import { ConfigService } from '@nestjs/config';
import { UrlService } from 'src/url/url.service';
import { Topic } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly shortUrlService: UrlService,
) {}


  /**
   * Get analytics for a specific topic.
   * @param topic The topic of the short URL
   * @returns Detailed analytics for the topic short URL
   */

  async getTopicAnalytics(topic: Topic) {
    const urls = await this.prisma.shortURL.findMany({
      where: { topic },
      include: { redirectLogs: true },
    });
  
    const totalClicks = urls.reduce((sum, url) => sum + url.redirectLogs.length, 0);
    const uniqueUsers = new Set(
      urls.flatMap((url) => url.redirectLogs.map((log) => log.ipAddress)),
    ).size;
  
    const clicksByDate = urls.flatMap((url) => url.redirectLogs);
    const aggregatedClicksByDate = this.aggregateClicksByDate(clicksByDate);
  
    return {
      totalClicks,
      uniqueUsers,
      clicksByDate: aggregatedClicksByDate,
      urls: urls.map((url) => ({
        shortUrl: url.shortAlias,
        totalClicks: url.redirectLogs.length,
        uniqueUsers: new Set(url.redirectLogs.map((log) => log.ipAddress)).size,
      })),
    };
  }

  /**
   * Get analytics for a specific short URL by alias.
   * @param alias The short URL alias
   * @returns Detailed analytics for the short URL
   */
  async getUrlAnalytics(alias: string) {
    try {
      const shortUrl = await this.prisma.shortURL.findUnique({
        where: { shortAlias: alias },
        include: { redirectLogs: true },
      });

      if (!shortUrl) {
        return E.left({ message: 'Short URL not found', statusCode: 404 });
      }

      const logs = shortUrl.redirectLogs;
      const totalClicks = logs.length;
      const uniqueUsers = new Set(logs.map((log) => log.ipAddress)).size;

      const clicksByDate = this.aggregateClicksByDate(logs);
      const osType = this.aggregateByField(logs, 'osName');
      const deviceType = this.aggregateByField(logs, 'deviceType');

      return E.right({
        totalClicks,
        uniqueUsers,
        clicksByDate,
        osType,
        deviceType,
      });
    } catch (error) {
      return E.left({ message: 'Failed to fetch analytics', statusCode: 500 });
    }
  }


  /**
 * Get overall analytics for all short URLs created by the authenticated user.
 * @param userId The authenticated user's ID
 * @returns Overall analytics for the user's URLs
 */
async getOverallAnalytics() {
    try {
      // Fetch all URLs created by the user
      const urls = await this.prisma.shortURL.findMany({
        // where: { userID: userId },
        include: { redirectLogs: true },
      });
  
      if (!urls.length) {
        return E.left({ message: 'No URLs found for the user', statusCode: 404 });
      }
  
      const totalUrls = urls.length;
      const totalClicks = urls.reduce((sum, url) => sum + url.redirectLogs.length, 0);
      const uniqueUsers = new Set(
        urls.flatMap((url) => url.redirectLogs.map((log) => log.ipAddress)),
      ).size;
  
      const clicksByDate = this.aggregateClicksByDate(
        urls.flatMap((url) => url.redirectLogs),
      );
  
      const osType = this.aggregateByField(
        urls.flatMap((url) => url.redirectLogs),
        'osName',
      );
  
      const deviceType = this.aggregateByField(
        urls.flatMap((url) => url.redirectLogs),
        'deviceType',
      );
  
      return E.right({
        totalUrls,
        totalClicks,
        uniqueUsers,
        clicksByDate,
        osType,
        deviceType,
      });
    } catch (error) {
      return E.left({ message: 'Failed to fetch overall analytics', statusCode: 500 });
    }
  }

  /**
   * Aggregates clicks by date for the past 7 days.
   * @param logs Redirect logs
   * @returns An array of date and click count
   */
  private aggregateClicksByDate(logs: any[]) {
    const startDate = subDays(new Date(), 7);
    const clicksByDate = {};

    logs.forEach((log) => {
      const date = startOfDay(new Date(log.timestamp)).toISOString();
      if (!clicksByDate[date]) {
        clicksByDate[date] = 0;
      }
      clicksByDate[date]++;
    });

    return Object.entries(clicksByDate)
      .filter(([date]) => new Date(date) >= startDate)
      .map(([date, count]) => ({ date, count }));
  }

  /**
   * Aggregates logs by a specific field (e.g., osName or deviceType).
   * @param logs Redirect logs
   * @param field The field to aggregate by
   * @returns An array of unique values and counts
   */
  private aggregateByField(logs: any[], field: string) {
    const aggregation: { [key: string]: { uniqueClicks: number; uniqueUsers: Set<string> } } = {};

    logs.forEach((log) => {
      const value = log[field] || 'Unknown';
      if (!aggregation[value]) {
        aggregation[value] = { uniqueClicks: 0, uniqueUsers: new Set() };
      }
      aggregation[value].uniqueClicks++;
      aggregation[value].uniqueUsers.add(log.ipAddress);
    });

    return Object.entries(aggregation).map(([name, data]) => ({
      name,
      uniqueClicks: data.uniqueClicks,
      uniqueUsers: data.uniqueUsers.size,
    }));
  }
}