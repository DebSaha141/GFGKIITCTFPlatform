const mongoose = require('mongoose');

const ctfStatusSchema = new mongoose.Schema({
    isRunning: {
        type: Boolean,
        default: false
    },
    startTime: {
        type: Date,
        default: null
    },
    endTime: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('CTFStatus', ctfStatusSchema); 