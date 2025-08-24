const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    branch: String,
    year: String,
    role: { type: String, enum: ['student', 'club_admin', 'super_admin'], default: 'student' },
    clubs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club' }],
    notificationPreferences: {
        email: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: false },
        push: { type: Boolean, default: false }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
