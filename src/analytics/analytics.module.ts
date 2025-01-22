import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { url } from 'inspector';
import { UrlService } from 'src/url/url.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, PrismaService, UrlService]
})
export class AnalyticsModule {}
