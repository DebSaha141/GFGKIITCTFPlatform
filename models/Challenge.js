const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');

const challengeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['General Skills', 'OSINT', 'Web Exploitation', 'Reverse Engineering', 'Forensics', 'Cryptography', 'Others']
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  flag: {
    type: String,
    required: true
  },
  files: [{
    filename: String,
    path: String,
    link: String // URL to external file or website
  }],
  hints: [{
    text: String,
    cost: {
      type: Number,
      default: 0
    }
  }],
  solvedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Sanitize inputs before saving
challengeSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.name = sanitizeHtml(this.name, { allowedTags: [] });
  }
  if (this.isModified('description')) {
    this.description = sanitizeHtml(this.description, { allowedTags: ['p', 'br', 'strong', 'em', 'code', 'pre'] });
  }
  if (this.isModified('flag')) {
    this.flag = sanitizeHtml(this.flag, { allowedTags: [] });
  }
  next();
});

// Index for faster queries
challengeSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Challenge', challengeSchema); 