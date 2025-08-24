const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: String,
    message: String,
    isRead: { type: Boolean, default: false },
    type: { type: String, enum: ['push', 'email', 'whatsapp'], default: 'push' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
