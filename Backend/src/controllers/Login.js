const User = require('../models/User');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');

async function loginHandler(req, res) {
  try {
    const { email, password } = req.body;

    // check if user exists
    const userToBeLoggedIn = await User.findOne({ email: email });
    if (!userToBeLoggedIn) {
      return res.status(404).json({ message: "No account found" });
    }

    // verify password
    const isMatch = await bcrypt.compare(password, userToBeLoggedIn.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    // generate JWT
    const token = JWT.sign(
      { id: userToBeLoggedIn._id, email: userToBeLoggedIn.email, role: userToBeLoggedIn.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // send token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // success response
    res.status(200).json({
      message: "Login successful",
      user: {
        id: userToBeLoggedIn._id,
        email: userToBeLoggedIn.email,
        role: userToBeLoggedIn.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = loginHandler;
