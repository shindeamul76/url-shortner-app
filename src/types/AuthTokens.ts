import { StatusCodes } from "http-status-codes";

export type AuthTokens = {
    access_token: string;
    refresh_token: string;
  };
  
  export enum AuthTokenType {
    ACCESS_TOKEN = 'access_token',
    REFRESH_TOKEN = 'refresh_token',
  }
  


export interface AccessTokenPayload {
    iss: string; // iss:issuer
    sub: number; // sub:subject
    aud: [string]; // aud:audience
    iat?: number; // iat:issued at time
  }
  
  export interface RefreshTokenPayload {
    iss: string;
    sub: number;
    aud: [string];
    iat?: number;
  }
  

  export type RefreshAuthTokensError =
  | { message: 'user/not_found'; statusCode: StatusCodes.NOT_FOUND }
  | { message: 'auth/invalid_refresh_token'; statusCode: StatusCodes.BAD_REQUEST }
  | { message: string; statusCode: StatusCodes.BAD_GATEWAY }; 