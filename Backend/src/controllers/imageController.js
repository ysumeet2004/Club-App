const Club = require("../models/Club");

// Upload and add image to gallery
exports.addGalleryImage = async (req, res) => {
  try {
    const { clubId } = req.params;
    const caption = req.body.caption || "";

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Generate image path (served via /uploads)
    const imagePath = `/uploads/${req.file.filename}`;

    // Find club and update gallery
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

    club.gallery.push({ url: imagePath, caption });
    await club.save();

    res.json({
      message: "Image added to gallery successfully",
      gallery: club.gallery,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Replace club logo
exports.updateLogo = async (req, res) => {
  try {
    const { clubId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const club = await Club.findByIdAndUpdate(
      clubId,
      { logo: imagePath },
      { new: true }
    );

    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

    res.json({
      message: "Logo updated successfully",
      logo: club.logo,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Replace club cover image
exports.updateCoverImage = async (req, res) => {
  try {
    const { clubId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const club = await Club.findByIdAndUpdate(
      clubId,
      { coverImage: imagePath },
      { new: true }
    );

    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

    res.json({
      message: "Cover image updated successfully",
      coverImage: club.coverImage,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
