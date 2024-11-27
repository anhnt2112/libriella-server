import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'emails', 'name', 'link', 'picture', 'short_name'],
      scope: ['email', 'public_profile', 'user_link']
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any): Promise<any> {
    const { id, emails, name, _json, photos} = profile;
    const user = {
      facebookId: id,
      firstName: name?.givenName,
      lastName: name?.familyName,
      link: _json.link,
      emails: emails[0].value,
      avatar: photos[0].value,
      accessToken,
    };
    done(null, user);
  }
}
