require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// Initialize CTF status
global.ctfStatus = 'stopped';

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'gfgctfisbest',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60 // 24 hours
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Flash messages middleware
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Initialize Passport configuration
require('./config/passport')(passport);

// Global variables middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    res.locals.ctfStatus = global.ctfStatus;
    next();
});

// Routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const challengesRouter = require('./routes/challenges');
const submissionsRouter = require('./routes/submissions');
const leaderboardRouter = require('./routes/leaderboard');
const adminRouter = require('./routes/admin');
const profileRouter = require('./routes/profile');

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/challenges', challengesRouter);
app.use('/submissions', submissionsRouter);
app.use('/leaderboard', leaderboardRouter);
app.use('/admin', adminRouter);
app.use('/profile', profileRouter);

// 404 handler
app.use((req, res, next) => {
    res.status(404).render('404', {
        title: '404 - Page Not Found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).render('error', { 
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// For Vercel deployment
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Export for Vercel
module.exports = app; 