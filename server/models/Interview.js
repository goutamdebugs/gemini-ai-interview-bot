const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: [true, 'Message content is required'],
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    sessionId: {
        type: String,
        required: true,
        index: true // For faster querying
    },
    metadata: {
        tokensUsed: Number,
        responseTime: Number,
        questionType: String
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for faster queries by user and session
InterviewSchema.index({ userId: 1, sessionId: 1, timestamp: 1 });

module.exports = mongoose.model('Interview', InterviewSchema);