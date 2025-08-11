const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    name: String,
    description: String,
    start_time: Date,
    status: { type: String, enum: ['upcoming', 'active', 'completed'], default: 'upcoming' }
}, { timestamps: true });

module.exports = mongoose.model('Round', roundSchema);
