// routes/clubRoutes.js

const express = require("express");
const Club = require('../models/Club');
const router = express.Router();
const { updateClubPage, getClubPage } = require("../controllers/ClubController");
const authMiddleware = require("../middlewares/Auth");
const multer = require("multer");
const path = require("path");
const {
  addGalleryImage,
  updateLogo,
  updateCoverImage,
} = require("../controllers/imageController");
// PUT -> update club customizable page
router.put("/:id/customize", authMiddleware, updateClubPage);

// GET -> fetch club customizable page
router.get("/:id/customize", getClubPage);

// Multer config
// const storage = multer.diskStorage({
//   destination: "./uploads/",
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage });


const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed."));
    }
    cb(null, true);
  },
});
router.put("/update/:id", async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.description) updates.description = req.body.description;
    const updatedClub = await Club.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!updatedClub) return res.status(404).json({ error: "Club not found" });

    res.json(updatedClub);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update club" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ error: "Club not found" });
    res.json(club);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes
router.post("/:clubId/gallery", upload.single("image"), addGalleryImage);
router.put("/:clubId/logo", upload.single("image"), updateLogo);
router.put("/:clubId/cover", upload.single("image"), updateCoverImage);

module.exports = router;
