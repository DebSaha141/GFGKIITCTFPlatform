const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// Home page
router.get('/', (req, res) => {
    res.render('index', {
        user: req.user,
        pageClass: 'home-page'
    });
});

// Dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const Challenge = require('../models/Challenge');
        const Category = require('../models/Category');
        const User = require('../models/User');
        const Submission = require('../models/Submission');
        const CTFStatus = require('../models/CTFStatus');

        // Get CTF status
        const ctfStatus = await CTFStatus.findOne() || new CTFStatus();

        // Get user's solved challenges with details
        const solvedChallenges = await Challenge.find({
            _id: { $in: req.user.solvedChallenges }
        }).select('name category points');

        // Get recent activities (submissions)
        const recentActivities = await Submission.find()
            .populate('user', 'username')
            .populate('challenge', 'name category points')
            .sort({ createdAt: -1 })
            .limit(10);

        // Calculate user's rank
        const rank = await User.countDocuments({
            points: { $gt: req.user.points }
        }) + 1;

        // Get challenge categories and counts
        const categories = await Category.find().sort('order');
        const categoryStats = await Promise.all(categories.map(async category => {
            const totalChallenges = await Challenge.countDocuments({ category: category.name, isActive: true });
            const solvedChallenges = await Challenge.countDocuments({
                category: category.name,
                _id: { $in: req.user.solvedChallenges }
            });
            return {
                ...category.toObject(),
                totalChallenges,
                solvedChallenges
            };
        }));

        res.render('dashboard', {
            user: {
                ...req.user.toObject(),
                solvedChallenges,
                rank
            },
            recentActivities,
            categoryStats,
            ctfStatus: ctfStatus.isRunning ? 'running' : 'stopped'
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'An error occurred while loading the dashboard.'
        });
    }
});

// Profile
router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const Challenge = require('../models/Challenge');
        const User = require('../models/User');

        // Get solved challenges with details
        const solvedChallenges = await Challenge.find({
            _id: { $in: req.user.solvedChallenges }
        }).populate('category');

        // Calculate user's rank
        const rank = await User.countDocuments({
            points: { $gt: req.user.points }
        }) + 1;

        res.render('profile', {
            user: req.user,
            solvedChallenges,
            rank
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'An error occurred while loading the profile.'
        });
    }
});

module.exports = router; 