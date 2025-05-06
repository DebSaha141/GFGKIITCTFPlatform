const Admin = require('../models/Admin');
const CTFStatus = require('../models/CTFStatus');

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please log in to access this page');
    res.redirect('/auth/login');
};

const isNotAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/dashboard');
};

const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user instanceof Admin) {
        return next();
    }
    req.flash('error_msg', 'You do not have permission to access this page');
    res.redirect('/');
};

// Check if CTF is running
const isCTFRunning = async (req, res, next) => {
    try {
        const ctfStatus = await CTFStatus.findOne() || new CTFStatus();
        
        if (!ctfStatus.isRunning) {
            // Check if the request is an API request
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(403).json({ error: 'CTF is not running' });
            }
            // For regular page requests, render the error page
            return res.status(403).render('error', {
                message: 'CTF is not running'
            });
        }
        next();
    } catch (error) {
        console.error(error);
        if (req.xhr || req.headers.accept.includes('application/json')) {
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(500).render('error', {
            message: 'An error occurred while checking CTF status'
        });
    }
};

module.exports = {
    isAuthenticated,
    isNotAuthenticated,
    isAdmin,
    isCTFRunning
}; 