// routes/forms.js
const express = require("express");
const router = express.Router();
const Form = require("../models/Form");

// Save formId for an event
router.post("/save", async (req, res) => {
  const { eventId, formId, formName } = req.body;
  try {
    const form = await Form.findOneAndUpdate(
      { eventId },
      { formId, formName },
      { upsert: true, new: true }
    );
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get form for an event
router.get("/:eventId", async (req, res) => {
  try {
    const form = await Form.findOne({ eventId: req.params.eventId });
    if (!form) return res.status(404).json({ error: "No form found" });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete form
router.delete("/:eventId", async (req, res) => {
  try {
    await Form.findOneAndDelete({ eventId: req.params.eventId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
