const mongoose = require('mongoose');

const roundParticipantSchema = new mongoose.Schema({
    round: { type: mongoose.Schema.Types.ObjectId, ref: 'Round', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For solo events
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }, // For team events
    status: { type: String, enum: ['registered', 'present', 'qualified', 'eliminated'], default: 'registered' }
}, { timestamps: true });

module.exports = mongoose.model('RoundParticipant', roundParticipantSchema);
