const express = require('express');
const router__ = express.Router();
const mongoose = require('mongoose');
const excelJS = require('exceljs');
const multer = require("multer");
const path = require("path");
const Event = require('../models/Event');
const Round = require('../models/Round');
const RoundParticipant = require('../models/RoundParticipant');
const authMiddleware = require('../middlewares/Auth');

// GET /events/manage/:id
router__.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate({ path: 'teams', populate: { path: 'members' } })
      .populate('soloParticipants');
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /event/manage/:id/rounds
router__.get('/:id/rounds', async (req, res) => {
  try {
    const rounds = await Round.find({ event: req.params.id });
    res.json(rounds);
  } catch (error) {
    console.error("Error fetching rounds:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /events/manage/:id (auth required)
router__.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedEvent) return res.status(404).json({ error: "Event not found" });
    res.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// POST /event/manage/:eventId/add-solo-participant (auth required)
router__.post('/:eventId/add-solo-participant', authMiddleware, async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid eventId or userId' });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Check if userId is already in soloParticipants
    const isAlreadyParticipant = event.soloParticipants.some(id => id.equals(userId));
    if (!isAlreadyParticipant) {
      event.soloParticipants.push(userId);
      await event.save();
    }

    res.json({ message: 'User added as solo participant', soloParticipants: event.soloParticipants });
  } catch (error) {
    console.error('Error adding solo participant:', error);
    res.status(500).json({ error: 'Failed to add solo participant' });
  }
});

// GET /rounds/:roundId/participants
router__.get('/rounds/:roundId/participants', async (req, res) => {
  try {
    const participants = await RoundParticipant.find({ round: req.params.roundId })
      .populate('user')
      .populate({ path: 'team', populate: { path: 'members' } });
    res.json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ error: "Failed to fetch participants" });
  }
});

// POST /rounds/:roundId/participants (auth required)
router__.post('/rounds/:roundId/participants', authMiddleware, async (req, res) => {
  try {
    const roundId = req.params.roundId;
    const { userData, userId, teamId, status = 'registered', progress = 'in_progress' } = req.body;

    if (!roundId) {
      return res.status(400).json({ error: "Round ID is required" });
    }

    // You can extend validation here to check for userId or teamId presence as needed
    if (!userData && !userId && !teamId) {
      return res.status(400).json({ error: "Participant data is required" });
    }

    // Create new RoundParticipant
    const newParticipant = new RoundParticipant({
      round: roundId,
      event: req.body.eventId,
      user: userId || null,
      team: teamId || null,
      status,
      progress,
      userData, // store raw user data optionally
    });

    await newParticipant.save();

    res.status(201).json({ message: "Participant added to round", participant: newParticipant });
  } catch (error) {
    console.error("Error adding participant:", error);
    res.status(500).json({ error: "Failed to add participant" });
  }
});

// POST /rounds/:roundId/move (auth required)
router__.post('/rounds/:roundId/move', authMiddleware, async (req, res) => {
  try {
    const { participantId, nextRoundId } = req.body;

    const participant = await RoundParticipant.findById(participantId);
    if (!participant) return res.status(404).json({ error: "Participant not found" });

    // Remove participant from current round by deleting it
    await RoundParticipant.findByIdAndDelete(participantId);

    // Create new participant entry for next round
    const newParticipant = new RoundParticipant({
      round: nextRoundId,
      event: participant.event, 
      user: participant.user,
      team: participant.team,
      status: 'registered',
      progress: 'in_progress'
    });

    await newParticipant.save();

    res.json({ message: "Participant moved", from: participant, to: newParticipant });
  } catch (error) {
    console.error("Error moving participant:", error);
    res.status(500).json({ error: "Failed to move participant" });
  }
});


// GET /event/manage/:id/export - Excel export
router__.get('/:id/export', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('club');
    if (!event) return res.status(404).json({ error: "Event not found" });

    const rounds = await Round.find({ event: req.params.id });
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rounds Data');

    worksheet.columns = [
      { header: "Round Number", key: "roundNum", width: 15 },
      { header: "Round Name", key: "roundName", width: 20 },
      { header: "Participant", key: "participant", width: 25 },
      { header: "Status", key: "status", width: 15 },
    ];

    for (let i = 0; i < rounds.length; i++) {
      const round = rounds[i];
      const participants = await RoundParticipant.find({ round: round._id })
        .populate('user')
        .populate({ path: 'team', populate: { path: 'members' } });

      participants.forEach(p => {
        worksheet.addRow({
          roundNum: i + 1,
          roundName: round.name,
          participant: p.user ? p.user.name : (p.team ? p.team.name : "Unknown"),
          status: p.status
        });
      });
    }

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=event_${event._id}_rounds.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting Excel:", error);
    res.status(500).json({ error: "Failed to export Excel" });
  }
});


// Configure Multer storage
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
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

// Image upload route (auth required)
router__.post("/:id/upload-image", authMiddleware, upload.single("coverImage"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const eventId = req.params.id;
    const imagePath = `/uploads/${req.file.filename}`; // Public URL path

    // Update event coverImage field with the relative path
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { coverImage: imagePath },
      { new: true }
    );

    if (!updatedEvent) return res.status(404).json({ error: "Event not found" });

    res.json(updatedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload image" });
  }
});
module.exports = router__;
