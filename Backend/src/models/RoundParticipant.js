const mongoose = require('mongoose');

const roundParticipantSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, // add event
  round: { type: mongoose.Schema.Types.ObjectId, ref: 'Round', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For solo events
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }, // For team events
  progress: { type: String, enum: ['in_progress', 'moved', 'out'], default: 'in_progress' },
  status: { type: String, enum: ['registered', 'present', 'qualified', 'eliminated'], default: 'registered' }
}, { timestamps: true });

// Compound unique indexes
roundParticipantSchema.index({ event: 1, user: 1 }, { unique: true, sparse: true });
// roundParticipantSchema.index({ event: 1, team: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('RoundParticipant', roundParticipantSchema);
