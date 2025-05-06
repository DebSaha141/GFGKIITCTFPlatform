const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

module.exports = function(passport) {
  // User authentication strategy
  passport.use('local', new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        // Check if email is provided
        if (!email) {
          return done(null, false, { message: 'Please enter your email address.' });
        }

        // Check if password is provided
        if (!password) {
          return done(null, false, { message: 'Please enter your password.' });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        
        // Check if user exists
        if (!user) {
          return done(null, false, { message: 'No account found with this email. Please sign up first.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password. Please try again.' });
        }

        return done(null, user);
      } catch (error) {
        console.error('Authentication error:', error);
        return done(error);
      }
    }
  ));

  // Admin authentication strategy
  passport.use('admin', new LocalStrategy(
    { usernameField: 'username', passwordField: 'password' },
    async (username, password, done) => {
      try {
        const admin = await Admin.findOne({ username });
        if (!admin) {
          return done(null, false, { message: 'Incorrect username.' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, admin);
      } catch (error) {
        return done(error);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, {
      id: user._id,
      isAdmin: user instanceof Admin
    });
  });

  passport.deserializeUser(async (data, done) => {
    try {
      const Model = data.isAdmin ? Admin : User;
      const user = await Model.findById(data.id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}; 