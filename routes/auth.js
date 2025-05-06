const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const { isNotAuthenticated } = require('../middleware/auth');

// Login page
router.get('/login', isNotAuthenticated, (req, res) => {
    res.render('auth/login', {
        // error_msg: req.flash('error_msg'),
        // error: req.flash('error'),
        // success_msg: req.flash('success_msg'),
        pageClass: 'auth-page'
    });
});

// Login handler
router.post('/login', (req, res, next) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        req.flash('error_msg', 'Please fill in all fields');
        return res.redirect('/auth/login');
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Login error:', err);
            req.flash('error_msg', 'An error occurred during login. Please try again.');
            return res.redirect('/auth/login');
        }
        
        if (!user) {
            // Pass the specific error message from passport
            req.flash('error_msg', info.message);
            return res.redirect('/auth/login');
        }

        req.logIn(user, (err) => {
            if (err) {
                console.error('Login error:', err);
                req.flash('error_msg', 'An error occurred during login. Please try again.');
                return res.redirect('/auth/login');
            }
            
            req.flash('success_msg', `Welcome back, ${user.name}!`);
            return res.redirect('/dashboard');
        });
    })(req, res, next);
});

// Signup page
router.get('/signup', isNotAuthenticated, (req, res) => {
    res.render('auth/signup', {
        // error_msg: req.flash('error_msg'),
        // error: req.flash('error'),
        pageClass: 'auth-page'
    });
});

// Signup handler
router.post('/signup', async (req, res) => {
    try {
        const { name, username, email, password, roll } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            req.flash('error_msg', 'User already exists');
            return res.redirect('/auth/signup');
        }

        // Create new user
        const user = new User({
            name,
            username,
            email,
            password,
            roll
        });

        await user.save();
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error in registration');
        res.redirect('/auth/signup');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
            return res.redirect('/');
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/auth/login');
    });
});

module.exports = router;