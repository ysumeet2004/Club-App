const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
    title: { type: String, required: true },
    description: String,
    coverImage: String,
    registrationType: { type: String, enum: ['solo', 'team', 'both'], default: 'solo' },
    status: { type: String, enum: ['upcoming', 'active', 'completed'], default: 'upcoming' },
    startDate: Date,
    endDate: Date,
    maxParticipants: Number,
    teamSize: {
        min: Number,
        max: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
