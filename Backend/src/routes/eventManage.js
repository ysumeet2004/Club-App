const express = require('express');
const router__ = express.Router();
const mongoose = require('mongoose');
const excelJS = require('exceljs');

const Event = require('../models/Event');
const Round = require('../models/Round');
const RoundParticipant = require('../models/RoundParticipant');

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

// GET /events/manage/:id/rounds
router__.get('/:id/rounds', async (req, res) => {
  try {
    const rounds = await Round.find({ event: req.params.id });
    res.json(rounds);
  } catch (error) {
    console.error("Error fetching rounds:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /events/manage/:id
router__.put('/:id', async (req, res) => {
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

// GET /rounds/:roundId/participants
router__.get('/rounds/:roundId/participants', async (req, res) => {
  try {
    console.log('pahucha');
    const participants = await RoundParticipant.find({ round: req.params.roundId })
      .populate('user')
      .populate({ path: 'team', populate: { path: 'members' } });
      console.log(participants);
    res.json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ error: "Failed to fetch participants" });
  }
});

// POST /rounds/:roundId/move
// POST /rounds/:roundId/move
router__.post('/rounds/:roundId/move', async (req, res) => {
  try {
    const { participantId, nextRoundId } = req.body;

    const participant = await RoundParticipant.findById(participantId);
    if (!participant) return res.status(404).json({ error: "Participant not found" });

    // Remove participant from current round by deleting it
    await RoundParticipant.findByIdAndDelete(participantId);

    // Create new participant entry for next round
    const newParticipant = new RoundParticipant({
      round: nextRoundId,
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

module.exports = router__;
