import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { emails, displayName, photos, id } = profile;

      // Get email from profile, fallback to generated email if not available
      const email = emails?.[0]?.value || `${id}@google.user.gitgoose.com`;

      // Get name from profile, fallback to email username or id
      const name = displayName || email.split('@')[0] || id;

      // Get photo URL if available
      const picture = photos?.[0]?.value || null;

      const user = {
        id,
        email,
        firstName: name.split(' ')[0],
        lastName: name.split(' ')[1] || '',
        picture,
        accessToken,
      };

      const userDB = await this.authService.validateOAuthLogin(user);
      done(null, userDB);
    } catch (error) {
      done(error, null);
    }
  }
}
