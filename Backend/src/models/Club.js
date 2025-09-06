const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  logo: String,
  coverImage: String,
  gallery: [
    {
      url: String,
      caption: String,
      uploadedAt: { type: Date, default: Date.now },
    }
  ],
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      position: String,
    },
  ],
  socialLinks: {
    facebook: String,
    instagram: String,
    website: String,
  },
  customizablePage: {
    type: Object, // store Editor.js JSON output
    default: {},  // start empty
  },
}, { timestamps: true });

module.exports = mongoose.model("Club", clubSchema);
