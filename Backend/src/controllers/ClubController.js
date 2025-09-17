// controllers/clubController.js
const Club = require("../models/Club");

// Save or update Editor.js JSON
exports.updateClubPage = async (req, res) => {
  try {
    const clubId = req.params.id;
    const { customizablePage } = req.body; // Editor.js JSON

    const club = await Club.findByIdAndUpdate(
      clubId,
      { customizablePage },
      { new: true }
    );

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    res.json({ message: "Page updated successfully", club });
  } catch (err) {
    console.error("Error updating club page:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch Editor.js JSON for viewing
exports.getClubPage = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id).select("customizablePage");
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }
    res.json(club.customizablePage || {}); // Return empty object if field missing
    // console.log(club.customizablePage);
    // console.log(JSON.parse(club.customizablePage.blocks.data));
    


  } catch (err) {
    console.error("Error fetching club page:", err);
    res.status(500).json({ message: "Server error" });
  }
};
