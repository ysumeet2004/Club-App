const Club = require('../models/Club');
async function fetchAllClubs(req, res) {
  try {
    const data = await Club.find();
    console.log("Fetched clubs count:", data.length);
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching clubs:", err);
    res.status(500).json({ message: "Failed to fetch clubs" });
  }
}
module.exports = fetchAllClubs;