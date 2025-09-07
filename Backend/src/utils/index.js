const express = require("express");
const cors = require("cors");
const path = require('path');
require("dotenv").config();
const { signUpHandler } = require('../controllers/Signup');
const bodyParser = require('body-parser');
const connectDB = require('../DB/connection');
const cookieParser = require("cookie-parser");
const loginHandler = require('../controllers/Login');
const authMiddleware = require('../middlewares/Auth');
const getProfileHandler = require('../controllers/Profile');
const router = require("../routes/clubRoutes");
const fetchAllClubs = require('../controllers/allClub');
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(bodyParser.json());

// Serve uploads folder statically BEFORE routes that might use it
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes
app.post('/Signup', signUpHandler);
app.post('/Login', loginHandler);
app.get('/profile', authMiddleware, getProfileHandler);
app.use("/clubs", router);
app.get('/allClub',fetchAllClubs);
// Start server LAST
app.listen(PORT, () => {
  console.log(`Server connected to port ${PORT}`);
});
