import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthProvider, authProviderCheck } from '../helper';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AUTH_PROVIDER_NOT_SPECIFIED } from 'src/errors';
import { StatusCodes } from 'http-status-code';
import { throwHTTPErr } from 'src/utils';

@Injectable()
export class GoogleSSOGuard extends AuthGuard('google') implements CanActivate {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (
      !authProviderCheck(
        AuthProvider.GOOGLE,
        this.configService.get('ALLOWED_AUTH_PROVIDERS'),
      )
    ) {
      throwHTTPErr({ message: AUTH_PROVIDER_NOT_SPECIFIED, statusCode: StatusCodes.BAD_REQUEST });
    }

    return super.canActivate(context);
  }

  getAuthenticateOptions(context: ExecutionContext) {


    const req = context.switchToHttp().getRequest();

    return {
      state: {
        redirect_uri: req.query.redirect_uri || this.configService.get('REDIRECT_URL'),
      },
    };
  }
}
