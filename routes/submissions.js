const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const { isAuthenticated } = require('../middleware/auth');

// Submit flag
router.post('/submit', isAuthenticated, async (req, res) => {
    try {
        const { flag, challengeId } = req.body;

        if (!flag || !challengeId) {
            return res.status(400).json({
                error: 'Flag and challenge ID are required.'
            });
        }

        const challenge = await Challenge.findById(challengeId);

        if (!challenge) {
            return res.status(404).json({
                error: 'Challenge not found.'
            });
        }

        if (!challenge.isActive) {
            return res.status(403).json({
                error: 'This challenge is not active.'
            });
        }

        // Check if user has already solved this challenge
        if (req.user.solvedChallenges.includes(challengeId)) {
            return res.status(400).json({
                error: 'You have already solved this challenge.'
            });
        }

        // Create submission record
        const submission = new Submission({
            user: req.user._id,
            challenge: challengeId,
            flag,
            isCorrect: flag === challenge.flag
        });

        await submission.save();

        if (submission.isCorrect) {
            // Add challenge to user's solved challenges
            req.user.solvedChallenges.push(challengeId);
            req.user.points += challenge.points;
            await req.user.save();

            // Add user to challenge's solvedBy array
            challenge.solvedBy.push({
                user: req.user._id,
                solvedAt: new Date()
            });
            await challenge.save();

            return res.json({
                message: 'Correct flag! Challenge solved.',
                correct: true
            });
        } else {
            return res.json({
                message: 'Incorrect flag. Try again.',
                correct: false
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'An error occurred while submitting the flag.'
        });
    }
});

module.exports = router; 