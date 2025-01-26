import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AccessTokenPayload } from 'src/types/AuthTokens';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import * as O from 'fp-ts/Option';
import {
  INVALID_ACCESS_TOKEN,
  USER_NOT_FOUND,
} from 'src/errors';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly usersService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  /**
   * Validates the JWT payload and ensures the user exists.
   * @param payload Decoded JWT payload
   * @returns User object if validation succeeds
   */
  async validate(payload: AccessTokenPayload) {
    if (!payload) {
      throw new ForbiddenException(INVALID_ACCESS_TOKEN);
    }

    const user = await this.usersService.findUserById(payload.sub);
    
    if (O.isNone(user)) {
      throw new UnauthorizedException(USER_NOT_FOUND);
    }

    return user.value; // Attach the user to the request object
  }
}