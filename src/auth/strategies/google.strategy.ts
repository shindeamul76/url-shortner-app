import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import * as O from 'fp-ts/Option';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UserService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      passReqToCallback: true,
      
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    console.log('Full Profile:', JSON.stringify(profile, null, 2));
  
    const emails = profile?.emails;
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return done(new Error('No email found in Google profile'), null);
    }
  
    const email = emails[0]?.value;
    if (!email) {
      return done(new Error('Email is undefined in Google profile'), null);
    }
  
    const user = await this.usersService.findUserByEmail(email);
  
    if (O.isNone(user)) {
      const createdUser = await this.usersService.createUserSSO(
        accessToken,
        refreshToken,
        profile,
      );
      return done(null, createdUser);
    }
  
    return done(null, user);
  }
}
