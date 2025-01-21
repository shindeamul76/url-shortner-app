import { Controller, Get, Req, Request, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { GoogleSSOGuard } from './guards/google-sso.guard';
import { throwHTTPErr } from 'src/utils';
import { authCookieHandler } from './helper';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}


  @Get('providers')
  async getAuthProviders() {
    const providers = await this.authService.getAuthProviders();
    return {providers};
  }


    /**
   ** Route to initiate SSO auth via Google
   */
   @Get('google')
   @UseGuards(GoogleSSOGuard)
   async googleAuth(@Request() req) {}




  // @Get('providers')
  // @UseGuards(AuthGuard('google'))
  // async googleAuth() {
  //   // This endpoint starts the Google OAuth2 login flow
  // }
  

  @Get('google/redirect')
  @UseGuards(GoogleSSOGuard)
  async googleAuthRedirect(@Request() req, @Res() res) {
    const authTokens = await this.authService.generateAuthTokens(req.user.id);
    if (E.isLeft(authTokens)) throwHTTPErr(authTokens.left);
    authCookieHandler(
      res,
      authTokens.right,
      true,
      req.authInfo.state.redirect_uri,
    );
  }

  // @Get('google/redirect')
  // @UseGuards(AuthGuard('google'))
  // async googleAuthRedirect(@Req() req: Request) {
  //   const user = req.user;
  //   return this.authService.login(user);
  // }
}
