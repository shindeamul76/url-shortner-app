import { Get, Injectable, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RESTError } from 'src/types/RESTError';
import { UserService } from 'src/user/user.service';
import { StatusCodes } from 'http-status-codes';
import * as O from 'fp-ts/Option';
import { Response } from 'express';
import * as E from 'fp-ts/Either';
import { AccessTokenPayload, AuthTokens, RefreshTokenPayload } from 'src/types/AuthTokens';
import * as argon2 from 'argon2';
// import * as bcrypt from 'bcrypt';
import { AuthUser } from 'src/types/AuthUser';
import { INVALID_REFRESH_TOKEN, USER_NOT_FOUND } from 'src/errors';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

    /**
   * Generate new refresh token for user
   *
   * @param userId User Id
   * @returns Generated refreshToken
   */
    private async generateRefreshToken(userId: number) {
      const refreshTokenPayload: RefreshTokenPayload = {
        iss: this.configService.get('BASE_URL'),
        sub: userId,
        aud: [this.configService.get('BASE_URL')],
      };

  
      const refreshToken = await this.jwtService.sign(refreshTokenPayload, {
        expiresIn: this.configService.get('REFRESH_TOKEN_VALIDITY'), //7 Days
      });
  
      const refreshTokenHash = await argon2.hash(refreshToken);
  
      const updatedUser = await this.usersService.updateUserRefreshToken(
        refreshTokenHash,
        userId,
      );
      if (E.isLeft(updatedUser))
        return E.left(<RESTError>{
          message: updatedUser.left,
          statusCode: StatusCodes.NOT_FOUND as number,
        });
  
      return E.right(refreshToken);
    }


      /**
   * Generate access and refresh token pair
   *
   * @param userUid User ID
   * @returns Either of generated AuthTokens
   */
  async generateAuthTokens(userId: number) {
    const accessTokenPayload: AccessTokenPayload = {
      iss: this.configService.get('BASE_URL'),
      sub: userId,
      aud: [this.configService.get('BASE_URL')],
    };


    const refreshToken = await this.generateRefreshToken(userId);

    if (E.isLeft(refreshToken)) return E.left(refreshToken.left);

    return E.right(<AuthTokens>{
      access_token: await this.jwtService.sign(accessTokenPayload, {
        expiresIn: this.configService.get('ACCESS_TOKEN_VALIDITY'), //1 Day
      }),
      refresh_token: refreshToken.right,
    });
  }


    /**
   * Verify if Provider account exists for User
   *
   * @param user User Object
   * @param SSOUserData User data from SSO providers (Google)
   * @returns Either of existing user provider Account
   */
    async checkIfProviderAccountExists(user: AuthUser, SSOUserData) {
      const provider = await this.prismaService.account.findUnique({
        where: {
          verifyProviderAccount: {
            provider: SSOUserData.provider,
            providerAccountId: SSOUserData.id,
          },
        },
      });
  
      if (!provider) return O.none;
  
      return O.some(provider);
    }


    getAuthProviders() {
      return this.configService
      .get<string>('ALLOWED_AUTH_PROVIDERS')
      .split(',');
    }


      /**
   * Refresh refresh and auth tokens
   *
   * @param hashedRefreshToken Hashed refresh token received from client
   * @param user User Object
   * @returns Either of generated AuthTokens
   */
  async refreshAuthTokens(hashedRefreshToken: string, user: AuthUser) {
    // Check to see user is valid
    if (!user)
      return E.left({
        message: USER_NOT_FOUND,
        statusCode: StatusCodes.NOT_FOUND,
      });

    // Check to see if the hashed refresh_token received from the client is the same as the refresh_token saved in the DB
    const isTokenMatched = await argon2.verify(
      user.refreshToken,
      hashedRefreshToken,
    );
    if (!isTokenMatched)
      return E.left({
        message: INVALID_REFRESH_TOKEN,
        statusCode: StatusCodes.NOT_FOUND,
      });

    // if tokens match, generate new pair of auth tokens
    const generatedAuthTokens = await this.generateAuthTokens(user.id);
    if (E.isLeft(generatedAuthTokens))
      return E.left({
        message: generatedAuthTokens.left.message,
        statusCode: generatedAuthTokens.left.statusCode,
      });

    return E.right(generatedAuthTokens.right);
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
