const User = require('../models/User');
const Club = require('../models/Club');
const bcrypt = require('bcrypt');

async function signUpHandler(req, res) {
  try {
    const {
      name,
      email,
      phone,
      branch,
      year,
      role,
      password,
      clubName,
      description,
      logo,
      coverImage,
      facebook,
      instagram,
      website
    } = req.body;

    if (!name || !email || !phone || !role || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      phone,
      branch,
      year,
      role,
      password: hashedPassword
    });

    if (role === 'club_admin') {
      // create a club
      const newClub = new Club({
        name: clubName,
        description,
        logo,
        coverImage,
        socialLinks: {
          facebook,
          instagram,
          website
        },
        members: [{ user: user._id, position: 'Admin' }]
      });

      await newClub.save();

      // link club to user
      user.clubs = [newClub._id];
      await user.save();

      return res.status(201).json({
        message: "User and Club registered successfully",
        user,
        club: newClub
      });
    } else {
      await user.save();
      return res.status(201).json({
        message: "User registered successfully",
        user
      });
    }
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup" });
  }
}

module.exports = { signUpHandler };
