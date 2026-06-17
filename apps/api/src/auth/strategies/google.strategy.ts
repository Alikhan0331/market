import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export interface GoogleProfile {
  id: string;
  emails: { value: string; verified: boolean }[];
  displayName: string;
  photos: { value: string }[];
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    const clientID = config.get<string>('GOOGLE_CLIENT_ID') || 'GOOGLE_NOT_CONFIGURED';
    const clientSecret = config.get<string>('GOOGLE_CLIENT_SECRET') || 'GOOGLE_NOT_CONFIGURED';
    super({
      clientID,
      clientSecret,
      callbackURL: config.get<string>(
        'GOOGLE_CALLBACK_URL',
        'http://localhost:3001/auth/google/callback',
      ),
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): void {
    const { id, emails, displayName } = profile;
    const user = {
      googleId: id,
      email: emails[0].value,
      displayName,
    };
    done(null, user);
  }
}
