import { Controller, Get, Query, Request, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { GoogleSSOGuard } from './guards/google-sso.guard';
import { throwHTTPErr } from 'src/utils';
import { authCookieHandler } from './helper';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { UserLastLoginInterceptor } from 'src/interceptors/user-last-login.interceptor';
import { SkipThrottle } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from 'src/guards/throttler-behind-proxy.guard';
import { RTJwtAuthGuard } from './guards/rt-jwt-auth-guard';
import { AuthUser } from 'src/types/AuthUser';
import { StatusCodes } from 'http-status-codes';
import { USER_NOT_FOUND } from 'src/errors';
import { ApiExcludeEndpoint } from '@nestjs/swagger';



@UseGuards(ThrottlerBehindProxyGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) { }


  // @Get('providers')
  async getAuthProviders() {
    const providers = await this.authService.getAuthProviders();
    return { providers };
  }


  /**
 * Success endpoint to indicate successful authentication.
 */
  @Get('success')
  async authSuccess(
    @Query('access_token') accessToken: string,
    @Query('refresh_token') refreshToken: string,
  ) {
    return {
      message: 'OK',
      status: 'success',
      accessToken,
      refreshToken,
    };
  }



  /**
   ** Route to refresh auth tokens with Refresh Token Rotation
   */

  // @Get('refresh')
  @UseGuards(RTJwtAuthGuard)
  async refresh(
    user: AuthUser,
    refresh_token: string,
    @Res() res,
  ) {
    const newTokenPair = await this.authService.refreshAuthTokens(
      refresh_token,
      user,
    );
    // if (E.isLeft(newTokenPair.left)) throwHTTPErr(newTokenPair.left);
    // authCookieHandler(res, newTokenPair.right, false, null);
  }



  /**
 ** Route to initiate SSO auth via Google
 */
  @Get('google')
  @UseGuards(GoogleSSOGuard)
  async googleAuth(@Request() req) { }


  @Get('google/redirect')
  @ApiExcludeEndpoint()
  @SkipThrottle()
  @UseGuards(GoogleSSOGuard)
  @UseInterceptors(UserLastLoginInterceptor)
  async googleAuthRedirect(@Request() req, @Res() res) {

    const userId = req.user?.id || req.user?.value?.id;

    if (!userId) {
      throwHTTPErr({ message: USER_NOT_FOUND, statusCode: 400 });
    }

    const authTokens = await this.authService.generateAuthTokens(userId);

    if (E.isLeft(authTokens)) throwHTTPErr(authTokens.left);

    const redirectUrl = this.configService.get('REDIRECT_URL');

    authCookieHandler(
      res,
      authTokens.right,
      true,
      redirectUrl,
    );
  }

  /**
** Log user out by clearing cookies containing auth tokens
*/
  @Get('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.status(200).send();
  }


}
