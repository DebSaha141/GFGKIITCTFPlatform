const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const sanitizeHtml = require('sanitize-html');

// Get profile page
router.get('/', isAuthenticated, async (req, res) => {
    try {
        // Get user with solved challenges populated
        const user = await User.findById(req.user._id)
            .populate({
                path: 'solvedChallenges',
                select: 'name category points'
            })
            .exec();

        // Get submission timestamps for solved challenges
        const submissions = await Submission.find({
            user: req.user._id,
            isCorrect: true
        }).sort({ createdAt: -1 });

        // Create a map of challenge IDs to submission timestamps
        const solvedAtMap = new Map();
        submissions.forEach(submission => {
            solvedAtMap.set(submission.challenge.toString(), submission.createdAt);
        });

        // Add solvedAt timestamps to challenges
        const solvedChallenges = user.solvedChallenges.map(challenge => ({
            ...challenge.toObject(),
            solvedAt: solvedAtMap.get(challenge._id.toString())
        }));

        // Calculate rank
        const totalUsers = await User.countDocuments();
        console.log('Total users:', totalUsers);
        const usersWithHigherPoints = await User.countDocuments({
            points: { $gt: user.points }
        });
        const rank = usersWithHigherPoints + 1;

        res.render('profile', {
            user: {
                ...user.toObject(),
                solvedChallenges,
                rank
            },
            pageClass: 'profile-page'
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'An error occurred while loading the profile.'
        });
    }
});

// Edit profile
router.post('/edit', isAuthenticated, async (req, res) => {
    try {
        const { username, email, roll } = req.body;
        // console.log(req.body);

        // Check if username is already taken
        const existingUser = await User.findOne({
            username: sanitizeHtml(username, { allowedTags: [] }),
            _id: { $ne: req.user._id }
        });

        if (existingUser) {
            req.flash('error_msg', 'Username is already taken');
            return res.redirect('/dashboard');
        }

        // Update user
        const user = await User.findById(req.user._id);
        console.log(user);
        user.username = sanitizeHtml(username, { allowedTags: [] });
        user.email = sanitizeHtml(email, { allowedTags: [] });
        user.roll = sanitizeHtml(roll, { allowedTags: [] });
        await user.save().catch(err => console.error('Error:', err));

        req.flash('success_msg', 'Profile updated successfully');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Failed to update profile');
        res.redirect('/dashboard');
    }
});

module.exports = router; 