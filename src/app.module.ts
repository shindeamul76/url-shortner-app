import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { UrlModule } from './url/url.module';
import appConfig from './config/app.config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AnalyticsModule } from './analytics/analytics.module';
import { JwtStrategy } from './auth/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => [
        {
          ttl: +configService.get('RATE_LIMIT_TTL'),
          limit: +configService.get('RATE_LIMIT_MAX'),
        },
      ],
    }),
    AuthModule,
    PrismaModule,
    UserModule,
    UrlModule,
    AnalyticsModule
  ],
  controllers: [AppController],
  providers: [AppService,  JwtStrategy],
})
export class AppModule {}
