import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import { Errors, FAILED_TO_UPDATE_RATE_LIMIT } from 'src/errors';
import { StatusCodes } from 'http-status-codes';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GeoData } from 'src/types/Url-types';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class UrlService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
) {}

  /**
   * Creates a short URL for the given long URL.
   * @param createShortUrlDto Input data for short URL creation
   * @param userId User creating the short URL
   * @returns Object containing the short URL and creation time
   */
  async createShortUrl(createShortUrlDto: any, userId: number) {
    const { longUrl, shortAlias, topic } = createShortUrlDto;

    // Validate URL
    if (!this.isValidUrl(longUrl)) {
      return E.left(Errors.INVALID_URL);
    }

    // Enforce rate limiting
    const rateLimitResponse = await this.enforceRateLimit(userId);
    if (E.isLeft(rateLimitResponse)) {
      return rateLimitResponse;
    }

    // Check if custom alias is already in use
    if (shortAlias) {
      const existingAlias = await this.prisma.shortURL.findUnique({
        where: { shortAlias },
      });

      if (existingAlias) {
        return E.left(Errors.SHORT_ALIAS_IN_USE);
      }
    }

    const uniqueShortAlias = shortAlias || uuidv4().slice(0, 8);

    // Save the short URL to the database
    const newShortUrl = await this.prisma.shortURL.create({
      data: {
        longUrl,
        shortAlias: uniqueShortAlias,
        topic,
        userID: userId,
      },
    });

    const serverUrl = this.configService.get('SHORT_BASE_URL');

    return E.right({
      shortUrl: `${serverUrl}${uniqueShortAlias}`,
      createdAt: newShortUrl.createdAt,
    });
  }

  /**
   * Checks and enforces rate limits for URL creation.
   * @param userId User ID
   */
  private async enforceRateLimit(userId: number) {
    const now = new Date();

    // Fetch the user's rate limit record
    const rateLimit = await this.prisma.rateLimit.findUnique({
      where: { userID: userId },
    });

    // If no record exists, create one
    if (!rateLimit) {
      await this.prisma.rateLimit.create({
        data: {
          userID: userId,
          requestCount: 1,
          maxRequests: 10,
          timeWindowStart: now,
          timeWindowEnd: new Date(now.getTime() + 60 * 60 * 1000),
        },
      });
      return E.right(true);
    }

    // Check if the rate limit window has expired
    if (rateLimit.timeWindowEnd < now) {
      // Reset the rate limit
      await this.prisma.rateLimit.update({
        where: { userID: userId },
        data: {
          requestCount: 1,
          timeWindowStart: now,
          timeWindowEnd: new Date(now.getTime() + 60 * 60 * 1000),
        },
      });

      return E.right(true);
    }

    // Enforce the rate limit
    if (rateLimit.requestCount >= rateLimit.maxRequests) {
      return E.left(Errors.RATE_LIMIT_EXCEEDED);
    }

    await this.updateRateLimit(userId, rateLimit.requestCount);
    return E.right(true);
  }

  /**
   * Updates the user's rate limit record by incrementing the request count.
   * @param userId User ID
   * @param requestCount Current request count
   */
  async updateRateLimit(userId: number, requestCount: number) {
    return pipe(
      E.tryCatch(
        () =>
          this.prisma.rateLimit.update({
            where: { userID: userId },
            data: {
              requestCount: requestCount + 1,
            },
          }),
        () => ({
          message: FAILED_TO_UPDATE_RATE_LIMIT,
          statusCode: StatusCodes.BAD_REQUEST,
        }),
      ),
    );
  }

  /**
   * Validates if the given string is a valid URL.
   * @param url URL string
   * @returns Boolean indicating validity
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }



  /**
   * Fetches the original URL based on the short alias and logs analytics data.
   * @param alias The short alias
   * @param userAgent The user agent from the request
   * @param ipAddress The IP address of the requester
   * @param geoData Geolocation data of the requester
   * @returns Either the original URL or an error
   */
  async getOriginalUrlAndLog(
    alias: string,
    userAgent: string,
    ipAddress: string,
    osName: string | null, 
    deviceType: string | null,
    geoData: GeoData ,
  ) {
    let shortUrl: { id: string | number; longUrl: string  } | null = null;
  
    // Check the cache manager for the short URL
    if (this.cacheManager) {
      shortUrl = await this.cacheManager.get(alias);
    }

  
    // Fallback to database lookup if not found in cache
    if (!shortUrl) {
      shortUrl = await this.prisma.shortURL.findUnique({
        where: { shortAlias: alias },
        select: { id: true, longUrl: true }, // Fetch only necessary fields
      });
  
      // If the short URL is found, set it in the cache
      if (shortUrl && this.cacheManager) {
        await this.cacheManager.set(alias, shortUrl, 300 * 1000 );
      }
    }

  
    // Handle case where the short URL is not found
    if (!shortUrl) {
      return E.left(Errors.SHORT_URL_NOT_FOUND);
    }
  
    // Update analytics log
    const logResult = await this.logRedirect(Number(shortUrl.id), userAgent, ipAddress,  osName, deviceType, geoData);
    if (E.isLeft(logResult)) {
      console.warn('Failed to log analytics data:', logResult.left.message);
    }
  
    return E.right(shortUrl.longUrl);
  }

  /**
   * Logs analytics data for a redirect event.
   * @param shortUrlId The ID of the short URL
   * @param userAgent The user agent from the request
   * @param ipAddress The IP address of the requester
   * @param geoData Geolocation data of the requester
   */
  private async logRedirect(
    shortUrlId: number,
    userAgent: string,
    ipAddress: string,
    osName: string | null, 
    deviceType: string | null,
    geoData: GeoData,
  ) {

    return pipe(
      E.tryCatch(
        async () =>
          this.prisma.redirectLog.create({
            data: {
              shortUrlID: shortUrlId,
              userAgent: userAgent || 'Unknown',
              geoLocation: geoData.geolocation,
              osName: osName || 'Unknown',
              deviceType: deviceType || 'Unknown',
              ipAddress: ipAddress || 'Unknown',
              country: geoData.country || 'Unknown',
              region: geoData.region || 'Unknown',
              city: geoData.city || 'Unknown',
            },
          }),
        () => ({
          message: 'Failed to log redirect event',
          statusCode: StatusCodes.BAD_REQUEST,
        }),
      ),
    );
  }

  /**
   * Fetches geolocation data for the given IP address.
   * @param ipAddress The IP address of the requester
   * @returns Geolocation data including country, region, and city
   */
  async getGeoData(ipAddress: string) {
    if (!this.isValidIp(ipAddress)) {
      return { country: 'Unknown', region: 'Unknown', city: 'Unknown', geolocation: null };
    }

    try {
      const response = await axios.get(`https://ipapi.co/103.88.236.42/json/`);



      return {
        country: response.data.country,
        region: response.data.region,
        city: response.data.city,
        geolocation: JSON.stringify({
           latitude: response.data.latitude, 
           longitude: response.data.longitude, 
           timezone: response.data.timezone, 
           country: response.data.country_name, 
           region: response.data.region, 
           city: response.data.city 
          }),
      };
    } catch (error) {
      console.error('Failed to fetch geolocation data:', error.message);
      return { country: 'Unknown', region: 'Unknown', city: 'Unknown', geolocation: null };
    }
  }

  /**
   * Validates if the given string is a valid IP address.
   * @param ipAddress The IP address to validate
   * @returns True if the IP is valid, false otherwise
   */
  private isValidIp(ipAddress: string): boolean {
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ipAddress);
  }


  async processRequestData(req) {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    let ipAddress =
        req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'Unknown';

    if (ipAddress === '::1') {
        ipAddress = '127.0.0.1';
    }

    const realIpAddress = ipAddress.split(',')[0];

    // Parse the user-agent string to extract OS and device type
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    let osName = null;
    let deviceType = null;

    if (result) {
        osName = result.os.name;
        deviceType = result.device.type || 'desktop';
    }

    // Fetch geolocation data
    const geoData = await this.getGeoData(realIpAddress);

    return { userAgent, ipAddress: realIpAddress, osName, deviceType, geoData };
}
}