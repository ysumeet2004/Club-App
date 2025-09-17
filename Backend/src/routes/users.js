const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /users/byEmail?email=someone@example.com
router.get('/byEmail', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ message: "Email query parameter is required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select('_id name email');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user by email:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
