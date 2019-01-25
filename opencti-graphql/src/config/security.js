import passport from 'passport/lib';
import FacebookStrategy from 'passport-facebook';
import GithubStrategy from 'passport-github';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { join, head } from 'ramda';
import { loginFromProvider } from '../domain/user';
import conf from './conf';

const providers = [];
// Facebook
if (conf.get('providers:facebook')) {
  const facebookOptions = {
    clientID: conf.get('providers:facebook:client_id'),
    clientSecret: conf.get('providers:facebook:client_secret'),
    callbackURL: conf.get('providers:facebook:callback_uri'),
    profileFields: ['id', 'emails', 'name'],
    scope: 'email'
  };
  const facebookStrategy = new FacebookStrategy(
    facebookOptions,
    (accessToken, refreshToken, profile, done) => {
      // eslint-disable-next-line no-underscore-dangle
      const data = profile._json; // TODO CHECK THAT
      const name = `${data.last_name} ${data.first_name}`;
      const { email } = data;
      loginFromProvider(email, name)
        .then(token => {
          done(null, token);
        })
        .catch(err => {
          done(err);
        });
    }
  );
  passport.use(facebookStrategy);
  providers.push('facebook');
}
// Google
if (conf.get('providers:google')) {
  const googleOptions = {
    clientID: conf.get('providers:google:client_id'),
    clientSecret: conf.get('providers:google:client_secret'),
    callbackURL: conf.get('providers:google:callback_uri'),
    scope: 'email'
  };
  const googleStrategy = new GoogleStrategy(
    googleOptions,
    (token, tokenSecret, profile, done) => {
      const name = profile.displayName;
      const email = head(profile.emails).value;
      // let picture = head(profile.photos).value;
      loginFromProvider(email, name)
        .then(loggedToken => {
          done(null, loggedToken);
        })
        .catch(err => {
          done(err);
        });
    }
  );
  passport.use(googleStrategy);
  providers.push('google');
}
// Github
if (conf.get('providers:github')) {
  const githubOptions = {
    clientID: conf.get('providers:github:client_id'),
    clientSecret: conf.get('providers:github:client_secret'),
    callbackURL: conf.get('providers:github:callback_uri'),
    scope: 'user:email'
  };
  const githubStrategy = new GithubStrategy(
    githubOptions,
    (token, tokenSecret, profile, done) => {
      const { name } = profile;
      const email = head(profile.emails).value;
      // let picture = profile.avatar_url;
      loginFromProvider(email, name)
        .then(loggedToken => {
          done(null, loggedToken);
        })
        .catch(err => {
          done(err);
        });
    }
  );
  passport.use(githubStrategy);
  providers.push('github');
}

export const ACCESS_PROVIDERS = join(',', providers);
export default passport;
