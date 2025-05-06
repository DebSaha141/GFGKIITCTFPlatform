const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Submission = require('../models/Submission');
const { isAuthenticated } = require('../middleware/auth');

// Leaderboard page
router.get('/', isAuthenticated, async (req, res) => {
    try {
        // Get all users sorted by points (descending)
        const users = await User.find()
            .sort({ points: -1 })
            .select('username points solvedChallenges');
        
        // console.log('Users found:', users.length);
        // console.log('Sample user:', users[0] ? {
        //     id: users[0]._id,
        //     username: users[0].username,
        //     points: users[0].points,
        //     solvedChallenges: users[0].solvedChallenges
        // } : 'No users found');

        // Get the last submission time for each user
        const lastSubmissions = await Submission.aggregate([
            { $match: { isCorrect: true } },
            { $sort: { submittedAt: -1 } },
            { $group: {
                _id: '$user',
                lastSolved: { $first: '$submittedAt' }
            }}
        ]);

        // console.log('Last submissions found:', lastSubmissions.length);
        // console.log('Sample last submission:', lastSubmissions[0] ? {
        //     userId: lastSubmissions[0]._id,
        //     lastSolved: lastSubmissions[0].lastSolved
        // } : 'No submissions found');

        // Create a map of user IDs to their last solved time
        const lastSolvedMap = new Map();
        lastSubmissions.forEach(sub => {
            const userId = sub._id.toString();
            const lastSolved = sub.lastSolved;
            // console.log(`Mapping user ${userId} to lastSolved:`, lastSolved);
            lastSolvedMap.set(userId, lastSolved);
        });

        // Add last solved time to users and sort by points and last solved time
        const usersWithLastSolved = users.map(user => {
            const userId = user._id.toString();
            const lastSolved = lastSolvedMap.get(userId);
            // console.log(`User ${userId} (${user.username}) lastSolved:`, lastSolved);
            
            return {
                ...user.toObject(),
                lastSolved: lastSolved || null // Ensure null if no lastSolved time
            };
        }).sort((a, b) => {
            // First sort by points
            if (b.points !== a.points) {
                return b.points - a.points;
            }
            // If points are equal, sort by last solved time
            if (a.lastSolved && b.lastSolved) {
                return new Date(a.lastSolved) - new Date(b.lastSolved);
            }
            // If one has lastSolved and other doesn't, put the one with lastSolved first
            if (a.lastSolved) return -1;
            if (b.lastSolved) return 1;
            return 0;
        });

        // console.log('Final sorted users sample:', usersWithLastSolved.slice(0, 3).map(user => ({
        //     username: user.username,
        //     points: user.points,
        //     lastSolved: user.lastSolved
        // })));

        // console.log(usersWithLastSolved[0].lastSolved);

        res.render('leaderboard', {
            user: req.user,
            users: usersWithLastSolved,
            currentUser: req.user
        });
    } catch (error) {
        console.error('Error in leaderboard route:', error);
        res.status(500).render('error', {
            message: 'An error occurred while loading the leaderboard.'
        });
    }
});

module.exports = router; 