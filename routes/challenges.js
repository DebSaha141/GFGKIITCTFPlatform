const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Submission = require('../models/Submission');
const CTFStatus = require('../models/CTFStatus');
const { isAuthenticated, isCTFRunning } = require('../middleware/auth');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

// Get all challenges
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const challenges = await Challenge.find({ isActive: true });
        const totalUsers = await User.countDocuments();
        
        // Group challenges by category
        const categories = [
            'General Skills',
            'OSINT',
            'Web Exploitation',
            'Reverse Engineering',
            'Forensics',
            'Cryptography',
            'Others'
        ];

        const groupedChallenges = {};
        categories.forEach(category => {
            groupedChallenges[category] = challenges.filter(
                challenge => challenge.category === category
            );
        });

        const ctfStatus = await CTFStatus.findOne() || new CTFStatus();

        res.render('challenges/index', {
            groupedChallenges,
            categories,
            user: req.user,
            ctfStatus: ctfStatus.isRunning ? 'running' : 'stopped',
            totalUsers
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'An error occurred while loading challenges.'
        });
    }
});

// Get challenge details for modal
router.get('/:id/details', isAuthenticated, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Check if user has solved this challenge
        const hasSolved = req.user.solvedChallenges.includes(challenge._id);

        // Find the submission to get the solved timestamp if solved
        const submission = hasSolved ? await Submission.findOne({
            user: req.user._id,
            challenge: challenge._id,
            isCorrect: true
        }).sort({ createdAt: -1 }) : null;

        // Send challenge details
        const responseData = {
            name: challenge.name,
            description: challenge.description,
            category: challenge.category,
            points: challenge.points,
            files: challenge.files || [],
            // Show hints regardless of solve status
            hints: challenge.hints || [],
            solvedAt: submission ? submission.createdAt : null,
            isSolved: hasSolved
        };

        console.log('Sending challenge details:', responseData); // Debug log
        res.json(responseData);
    } catch (error) {
        console.error('Error in challenge details:', error);
        res.status(500).json({ error: 'Failed to get challenge details' });
    }
});

// Submit flag
router.post('/:id/submit', isAuthenticated, isCTFRunning, async (req, res) => {
    try {
        // Check if it's an AJAX request
        if (!req.xhr && !req.headers['x-requested-with']) {
            return res.status(403).json({ 
                success: false, 
                message: 'Direct API access is not allowed' 
            });
        }

        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            return res.status(404).json({ 
                success: false, 
                message: 'Challenge not found' 
            });
        }

        // Check if user has already solved this challenge
        if (req.user.solvedChallenges.includes(challenge._id)) {
            return res.json({ 
                success: false, 
                message: 'You have already solved this challenge' 
            });
        }

        const submittedFlag = sanitizeHtml(req.body.flag, { allowedTags: [] });
        const isCorrect = submittedFlag === challenge.flag;

        // Record submission
        const submission = new Submission({
            user: req.user._id,
            challenge: challenge._id,
            flag: submittedFlag,
            isCorrect
        });
        await submission.save();

        if (isCorrect) {
            challenge.solvedBy.push(req.user._id);
            await challenge.save();

            req.user.points += challenge.points;
            req.user.solvedChallenges.push(challenge._id);
            await req.user.save();

            return res.json({ 
                success: true, 
                message: 'Congratulations! Flag is correct' 
            });
        }

        res.json({ 
            success: false, 
            message: 'Incorrect flag' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred while submitting the flag' 
        });
    }
});

// Download challenge file
router.get('/:id/files/:filename', isAuthenticated, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res.status(404).render('error', {
                message: 'Challenge not found.'
            });
        }

        const file = challenge.files.find(f => f.filename === req.params.filename);

        if (!file) {
            return res.status(404).render('error', {
                message: 'File not found.'
            });
        }

        if (file.link) {
            return res.redirect(file.link);
        }

        res.download(path.join(__dirname, '..', file.path));
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'An error occurred while downloading the file.'
        });
    }
});

// Get hint
router.get('/:id/hints/:hintId', isAuthenticated, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res.status(404).json({
                error: 'Challenge not found.'
            });
        }

        const hint = challenge.hints.id(req.params.hintId);

        if (!hint) {
            return res.status(404).json({
                error: 'Hint not found.'
            });
        }

        // Check if user has enough points for the hint
        if (req.user.points < hint.cost) {
            return res.status(403).json({
                error: 'Not enough points to view this hint.'
            });
        }

        // Deduct points if hint has a cost
        if (hint.cost > 0) {
            req.user.points -= hint.cost;
            await req.user.save();
        }

        res.json({ hint: hint.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'An error occurred while retrieving the hint.'
        });
    }
});

module.exports = router; 