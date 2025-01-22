import { ConfigService } from "@nestjs/config";
import { AUTH_PROVIDER_NOT_SPECIFIED } from "src/errors";
import { AuthTokens, AuthTokenType } from "src/types/AuthTokens";
import { throwErr } from "src/utils";
import { DateTime } from 'luxon';
import { StatusCodes } from 'http-status-codes';
import { Response } from "express";



export enum AuthProvider {
    GOOGLE = 'GOOGLE',
}


export function authProviderCheck(
    provider: string,
    ALLOWED_AUTH_PROVIDERS: string,
  ) {
    if (!provider) {
      throwErr(AUTH_PROVIDER_NOT_SPECIFIED);
    }



    const envVariables = ALLOWED_AUTH_PROVIDERS
      ? ALLOWED_AUTH_PROVIDERS.split(',').map((provider) =>
          provider.trim().toUpperCase(),
        )
      : [];

  
    if (!envVariables.includes(provider.toUpperCase())) return false;
  
    return true;
  }




  /**
 * Sets and returns the cookies in the response object on successful authentication
 * @param res Express Response Object
 * @param authTokens Object containing the access and refresh tokens
 * @param redirect if true will redirect to provided URL else just send a 200 status code
 */
export const authCookieHandler = (
    res: Response,
    authTokens: AuthTokens,
    redirect: boolean,
    redirectUrl: string | null,
  ) => {
    const configService = new ConfigService();
  
    const currentTime = DateTime.now();
    const accessTokenValidity = currentTime
      .plus({
        milliseconds: parseInt(configService.get('ACCESS_TOKEN_VALIDITY')),
      })
      .toMillis();
    const refreshTokenValidity = currentTime
      .plus({
        milliseconds: parseInt(configService.get('REFRESH_TOKEN_VALIDITY')),
      })
      .toMillis();
  
    res.cookie(AuthTokenType.ACCESS_TOKEN, authTokens.access_token, {
      httpOnly: true,
      secure: configService.get('ALLOW_SECURE_COOKIES') === 'true',
      sameSite: 'lax',
      maxAge: accessTokenValidity,
    });
    res.cookie(AuthTokenType.REFRESH_TOKEN, authTokens.refresh_token, {
      httpOnly: true,
      secure: configService.get('ALLOW_SECURE_COOKIES') === 'true',
      sameSite: 'lax',
      maxAge: refreshTokenValidity,
    });
  
    if (!redirect) {
      return res.status(StatusCodes.OK).send();
    }
  
    // check to see if redirectUrl is a whitelisted url
    const whitelistedOrigins = configService
      .get('WHITELISTED_ORIGINS')
      .split(',');
    if (!whitelistedOrigins.includes(redirectUrl))
      // if it is not redirect by default to REDIRECT_URL
      redirectUrl = configService.get('REDIRECT_URL');
  
    return res.status(StatusCodes.OK).redirect(redirectUrl);
  };