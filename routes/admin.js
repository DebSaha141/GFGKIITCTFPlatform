const express = require('express');
const router = express.Router();
const passport = require('passport');
const Admin = require('../models/Admin');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const CTFStatus = require('../models/CTFStatus');
const { isAdmin } = require('../middleware/auth');
const Category = require('../models/Category');
const sanitizeHtml = require('sanitize-html');
const User = require('../models/User');

// Admin login page
router.get('/login', (req, res) => {
    if (req.user instanceof Admin) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', {
        pageClass: 'auth-page'
    });
});

// Admin login handler
router.post('/login', passport.authenticate('admin', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/admin/login',
    failureFlash: true
}));

// Admin dashboard
router.get('/dashboard', isAdmin, async (req, res) => {
    try {
        const challenges = await Challenge.find().sort({ createdAt: -1 });
        const activities = await Submission.find()
            .populate('user', 'username')
            .populate('challenge', 'name')
            .sort({ submittedAt: -1 })
            .limit(20);

        const ctfStatus = await CTFStatus.findOne() || new CTFStatus();
        
        res.render('admin/dashboard', {
            challenges,
            activities,
            ctfStatus: ctfStatus.isRunning ? 'running' : 'stopped'
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'An error occurred while loading the dashboard.'
        });
    }
});

// Start CTF
router.post('/ctf/start', isAdmin, async (req, res) => {
    try {
        let ctfStatus = await CTFStatus.findOne();
        if (!ctfStatus) {
            ctfStatus = new CTFStatus();
        }
        ctfStatus.isRunning = true;
        ctfStatus.startTime = new Date();
        await ctfStatus.save();
        
        req.flash('success_msg', 'CTF has been started');
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Failed to start CTF');
        res.redirect('/admin/dashboard');
    }
});

// Stop CTF
router.post('/ctf/stop', isAdmin, async (req, res) => {
    try {
        const ctfStatus = await CTFStatus.findOne();
        if (ctfStatus) {
            ctfStatus.isRunning = false;
            ctfStatus.endTime = new Date();
            await ctfStatus.save();
        }
        
        req.flash('success_msg', 'CTF has been stopped');
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Failed to stop CTF');
        res.redirect('/admin/dashboard');
    }
});

// Reset CTF
router.post('/ctf/reset', isAdmin, async (req, res) => {
    try {
        // Reset user scores and solved challenges
        await User.updateMany({}, {
            $set: {
                points: 0,
                solvedChallenges: []
            }
        });

        // Clear all submissions
        await Submission.deleteMany({});

        // Reset challenge solvedBy arrays
        await Challenge.updateMany({}, {
            $set: {
                solvedBy: []
            }
        });

        // Reset CTF status
        await CTFStatus.deleteMany({});
        
        req.flash('success_msg', 'CTF has been reset successfully');
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Failed to reset CTF');
        res.redirect('/admin/dashboard');
    }
});

// Add challenge
router.post('/challenges/add', isAdmin, async (req, res) => {
    try {
        const { name, description, points, category, flag, files, hints } = req.body;
        
        const challenge = new Challenge({
            name: sanitizeHtml(name, { allowedTags: [] }),
            description: sanitizeHtml(description, { allowedTags: ['p', 'br', 'strong', 'em', 'code', 'pre'] }),
            points: parseInt(points),
            category,
            flag: sanitizeHtml(flag, { allowedTags: [] }),
            files: files ? files.map(file => ({
                filename: sanitizeHtml(file.filename, { allowedTags: [] }),
                link: sanitizeHtml(file.link, { allowedTags: [] })
            })) : [],
            hints: hints ? hints.map(hint => ({
                text: sanitizeHtml(hint.text, { allowedTags: [] }),
                cost: parseInt(hint.cost)
            })) : []
        });

        await challenge.save();
        req.flash('success_msg', 'Challenge added successfully');
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Failed to add challenge');
        res.redirect('/admin/dashboard');
    }
});

// Get challenge details for editing
router.get('/challenges/:id', isAdmin, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }
        res.json(challenge);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get challenge details' });
    }
});

// Edit challenge
router.post('/challenges/:id/edit', isAdmin, async (req, res) => {
    try {
        const { name, description, points, category, flag, files, hints } = req.body;
        
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            req.flash('error_msg', 'Challenge not found');
            return res.redirect('/admin/dashboard');
        }

        challenge.name = sanitizeHtml(name, { allowedTags: [] });
        challenge.description = sanitizeHtml(description, { allowedTags: ['p', 'br', 'strong', 'em', 'code', 'pre'] });
        challenge.points = parseInt(points);
        challenge.category = category;
        challenge.flag = sanitizeHtml(flag, { allowedTags: [] });
        challenge.files = files ? files.map(file => ({
            filename: sanitizeHtml(file.filename, { allowedTags: [] }),
            link: sanitizeHtml(file.link, { allowedTags: [] })
        })) : [];
        challenge.hints = hints ? hints.map(hint => ({
            text: sanitizeHtml(hint.text, { allowedTags: [] }),
            cost: parseInt(hint.cost)
        })) : [];

        await challenge.save();
        req.flash('success_msg', 'Challenge updated successfully');
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Failed to update challenge');
        res.redirect('/admin/dashboard');
    }
});

// Remove challenge
router.post('/challenges/remove/:id', isAdmin, async (req, res) => {
    try {
        await Challenge.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Challenge removed successfully');
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Failed to remove challenge');
        res.redirect('/admin/dashboard');
    }
});

// Admin logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'You have been logged out');
        res.redirect('/admin/login');
    });
});

module.exports = router; 