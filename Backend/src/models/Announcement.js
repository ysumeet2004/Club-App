const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club' },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    title: String,
    message: String,
    type: { type: String, enum: ['general', 'event', 'urgent'], default: 'general' }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
