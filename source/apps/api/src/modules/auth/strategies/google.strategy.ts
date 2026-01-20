import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { EnvConfig } from '../../../config/env.validation';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly config: ConfigService<EnvConfig, true>) {
    const clientID = config.get('GOOGLE_CLIENT_ID', { infer: true });
    const clientSecret = config.get('GOOGLE_CLIENT_SECRET', { infer: true });
    const callbackURL = config.get('GOOGLE_CALLBACK_URL', { infer: true });

    // Only initialize if credentials are provided
    super({
      clientID: clientID || 'not-configured',
      clientSecret: clientSecret || 'not-configured',
      callbackURL: callbackURL || 'http://localhost:3000/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: true, // Pass request to get state parameter
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, name, emails, photos } = profile;
    
    // Get origin from state parameter (customer or tenant)
    const origin = req.query?.state || 'tenant';
    
    const user = {
      googleId: id,
      email: emails?.[0]?.value || '',
      fullName: `${name?.givenName || ''} ${name?.familyName || ''}`.trim(),
      avatarUrl: photos?.[0]?.value,
      origin, // Pass origin to callback handler
    };
    
    done(null, user);
  }
}
