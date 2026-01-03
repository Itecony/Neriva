const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const configurePassport = () => {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists with Google ID
        let user = await User.findOne({ where: { googleId: profile.id } });

        if (user) {
          return done(null, user);
        }

        // Check if email exists
        user = await User.findOne({ where: { email: profile.emails[0].value } });
        
        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.authProvider = 'google';
          user.profilePicture = profile.photos[0]?.value;
          await user.save();
          return done(null, user);
        }

        // Create new user - split display name into firstName and lastName
        const nameParts = profile.displayName.split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';

        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          firstName: firstName,
          lastName: lastName,
          profilePicture: profile.photos[0]?.value,
          authProvider: 'google'
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

module.exports = configurePassport;