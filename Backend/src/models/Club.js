const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    logo: String,
    coverImage: String,
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        position: String
    }],
    socialLinks: {
        facebook: String,
        instagram: String,
        website: String
    },
    customizablePage: String // Can store markdown or HTML
}, { timestamps: true });

module.exports = mongoose.model('Club', clubSchema);
