const mongoose = require('mongoose');

const userAnnouncementReadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  announcementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Announcement', required: true },
  readAt: { type: Date, default: Date.now }
});

// Create a compound index for efficient lookups (user + announcement)
userAnnouncementReadSchema.index({ userId: 1, announcementId: 1 }, { unique: true });

module.exports = mongoose.model('UserAnnouncementRead', userAnnouncementReadSchema);
