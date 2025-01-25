import { Body, Controller, Get, Param, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { UrlService } from './url.service';
import { ConfigService } from '@nestjs/config';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { Response, Request } from 'express';
import { throwHTTPErr } from 'src/utils';
import * as E from 'fp-ts/Either';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { errorHtml } from './helper';

import { get } from 'http';



@Controller('')
export class UrlController {

    constructor(
        private readonly urlService: UrlService,
        private readonly configService: ConfigService,
    ) { }

    /**
    * POST /api/shorten
    * Creates a short URL for the given long URL.
    * @param longUrl Original URL to be shortened
    * @param customAlias Optional custom alias for the short URL
    * @param topic Optional topic for grouping URLs
    * @param req HTTP request object (for authenticated user data)
    * @returns Object containing the short URL and creation time
    */

    @Post('api/shorten')
    @UseGuards(JwtAuthGuard)
    async createShortUrl(@Body() createShortUrlDto: CreateShortUrlDto, @Req() req) {
        const userId = req.user.id; // Extract authenticated user ID
        return this.urlService.createShortUrl(createShortUrlDto, userId);
    }



    /**
     * Redirects to the original URL based on the alias and logs analytics data.
     * @param alias The short alias
     * @param req The HTTP request
     * @param res The HTTP response
     */
    @Get('api/shorten/:alias')
    async redirectToOriginalUrl(
        @Param('alias') alias: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        // Process and extract user and geo data
        const { userAgent, ipAddress, osName, deviceType, geoData } = await this.urlService.processRequestData(req);


        const urlResult = await this.urlService.getOriginalUrlAndLog(alias, userAgent, ipAddress, osName, deviceType, geoData);

        if (E.isLeft(urlResult)) {
            // Return custom HTML for errors
            return res.status(urlResult.left.statusCode).send(errorHtml);
        }

        return res.redirect(urlResult.right);
    }

}
