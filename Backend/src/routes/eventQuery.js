const express = require('express');
const router_ = express.Router();
const Event = require('../models/Event');
const Team = require('../models/Team');
const Round = require('../models/Round');

// ✅ GET /events?club=clubId&sort=createdAt
router_.get('/', async (req, res) => {
  try {
    const { club, sort } = req.query;
    if (!club) return res.status(400).json({ error: "club query parameter is required" });

    const sortOption = {};
    if (sort) {
      if (sort.startsWith('-')) sortOption[sort.substring(1)] = -1;
      else sortOption[sort] = 1;
    } else {
      sortOption.createdAt = -1;
    }

    const events = await Event.find({ club })
      .populate({
        path: 'teams',
        populate: { path: 'members' }
      })
      .populate('soloParticipants')
      .sort(sortOption)
      .lean();

    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ GET /events/:id
router_.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate({
        path: 'teams',
        populate: { path: 'members' }
      })
      .populate('soloParticipants');
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ POST /events
router_.post('/', async (req, res) => {
  try {
    const {
      club,
      title,
      description,
      coverImage,
      registrationType,
      status,
      startDate,
      endDate,
      maxParticipants,
      teamSize,
      visibility,
      rounds, // Expect rounds array here
      fee = 0,
      pricePool = 0
    } = req.body;

    if (!club) return res.status(400).json({ error: "Club ID is required" });
    if (!title) return res.status(400).json({ error: "Event title is required" });
    if (!startDate) return res.status(400).json({ error: "Start date is required" });

    const newEvent = new Event({
      club,
      title,
      description,
      coverImage,
      registrationType: registrationType || 'solo',
      status: status || 'upcoming',
      startDate,
      endDate,
      maxParticipants,
      teamSize,
      visibility: visibility || 'public',
      teams: [],
      soloParticipants: [],
    });

    const savedEvent = await newEvent.save();

    // Create rounds if rounds array is provided
    if (rounds && Array.isArray(rounds) && rounds.length > 0) {
      for (const round of rounds) {
        const roundCount = await Round.countDocuments({ event: savedEvent._id });
        const newRound = new Round({
          event: savedEvent._id,
          name: round.name,
          description: round.description,
          start_time: round.date,
          roundNumber: roundCount + 1,
          status: 'upcoming'
        });
        await newRound.save();
      }
    }

    res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// ✅ PUT /events/:id
router_.put('/:id', async (req, res) => {
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

// ✅ DELETE /events/:id
router_.delete('/:id', async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

// ✅ POST /events/:id/register-solo
router_.post('/:id/register-solo', async (req, res) => {
  try {
    const { userId } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.registrationType !== 'solo') {
      return res.status(400).json({ error: "This event requires team registration" });
    }

    if (event.soloParticipants.includes(userId)) {
      return res.status(400).json({ error: "User already registered" });
    }

    event.soloParticipants.push(userId);
    await event.save();
    res.json({ message: "Solo participant registered successfully", event });
  } catch (error) {
    console.error("Error registering solo:", error);
    res.status(500).json({ error: "Failed to register solo participant" });
  }
});

// ✅ POST /events/:id/register-team
router_.post('/:id/register-team', async (req, res) => {
  try {
    const { teamId } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.registrationType !== 'team') {
      return res.status(400).json({ error: "This event requires solo registration" });
    }

    if (event.teams.includes(teamId)) {
      return res.status(400).json({ error: "Team already registered" });
    }

    event.teams.push(teamId);
    await event.save();
    res.json({ message: "Team registered successfully", event });
  } catch (error) {
    console.error("Error registering team:", error);
    res.status(500).json({ error: "Failed to register team" });
  }
});
// GET /events - fetch all events with populated clubs, teams (and members), soloParticipants
router_.get("/get/all", async (req, res) => {
  try {
    const events = await Event.find()
      .populate("club") // populate club details like name, logo
      .populate({
        path: "teams",
        populate: { path: "members" } // populate team members
      })
      .populate("soloParticipants") // populate solo participant user details
      .exec();

    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router_;
