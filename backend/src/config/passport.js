import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["hash_password", "refresh_token_hash"] },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy - Only initialize if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${
          process.env.BACKEND_URL || "http://localhost:3000"
        }/api/users/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({ where: { google_id: profile.id } });

          if (user) {
            // User exists, update avatar with latest Google avatar if available
            if (profile.photos && profile.photos.length > 0) {
              user.avatar_url = profile.photos[0].value;
              await user.save();
            }
            return done(null, user);
          }

          // Check if user exists with same email
          user = await User.findOne({
            where: { email: profile.emails[0].value },
          });

          if (user) {
            // User exists with same email, link Google account
            user.google_id = profile.id;
            user.provider = "google";
            // Always update avatar with Google avatar if available
            if (profile.photos && profile.photos.length > 0) {
              user.avatar_url = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }

          // Create new user
          const newUser = await User.create({
            google_id: profile.id,
            full_name: profile.displayName,
            email: profile.emails[0].value,
            avatar_url:
              profile.photos && profile.photos.length > 0
                ? profile.photos[0].value
                : null,
            provider: "google",
            hash_password: null, // No password for OAuth users
          });

          return done(null, newUser);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn(
    "Google OAuth credentials not found. Google login will be disabled."
  );
}

export default passport;
