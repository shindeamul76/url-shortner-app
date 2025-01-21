import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RESTError } from 'src/types/RESTError';
import { UserService } from 'src/user/user.service';
import { StatusCodes } from 'http-status-code';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { AccessTokenPayload, AuthTokens, RefreshTokenPayload } from 'src/types/AuthTokens';
import * as argon2 from 'argon2';
// import * as bcrypt from 'bcrypt';
import { AuthUser } from 'src/types/AuthUser';


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
          statusCode: StatusCodes.NOT_FOUND,
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

}
