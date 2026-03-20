const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const authMiddleware = require('../middlewares/Auth');

// Create a new announcement (auth required)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { club, event, title, message, type } = req.body;

    const newAnnouncement = new Announcement({
      
      event,
      title,
      message,
      type,
    });

    const savedAnnouncement = await newAnnouncement.save();
    res.status(201).json(savedAnnouncement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// Get all announcements for an event, ordered newest first
router.get('/:eventId', async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const announcements = await Announcement.find({ event: eventId }).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Update an announcement by ID (auth required)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const announcementId = req.params.id;
    const updateData = req.body;

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(announcementId, updateData, { new: true });

    if (!updatedAnnouncement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(updatedAnnouncement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

// Delete an announcement by ID (auth required)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const announcementId = req.params.id;

    const deletedAnnouncement = await Announcement.findByIdAndDelete(announcementId);

    if (!deletedAnnouncement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

module.exports = router;
