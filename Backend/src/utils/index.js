const express = require("express");
const cors = require("cors");
const path = require('path');
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const { signUpHandler } = require('../controllers/Signup');
const bodyParser = require('body-parser');
const connectDB = require('../DB/connection');
const cookieParser = require("cookie-parser");
const loginHandler = require('../controllers/Login');
const authMiddleware = require('../middlewares/Auth');
const getProfileHandler = require('../controllers/Profile');
const router = require("../routes/clubRoutes");
const fetchAllClubs = require('../controllers/allClub');
const Event = require('../routes/eventQuery');
const router__ = require('../routes/eventManage');
const formRouter = require('../routes/Forms');
const userRoutes = require('../routes/users');
const announcementRouter = require('../routes/Announcement');
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(bodyParser.json());

// Serve uploads folder statically BEFORE routes that might use it
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// CSRF protection: validate Origin header for state-changing requests.
// SameSite=Strict on the JWT cookie already prevents cross-site cookie sending,
// but this header check provides defense-in-depth for non-browser clients.
const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const origin = req.headers.origin || req.headers.referer || '';
    if (origin && !origin.startsWith(allowedOrigin)) {
      return res.status(403).json({ message: "Forbidden: invalid request origin" });
    }
  }
  next();
});

// General API rate limiter: max 200 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

// Rate limiter for login: max 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
});

// Apply general rate limiter to all routes
app.use(apiLimiter);

// Routes
app.post('/Signup', signUpHandler);
app.post('/Login', loginLimiter, loginHandler);
app.get('/profile', authMiddleware, getProfileHandler);
app.use("/clubs", router);
app.get('/allClub',fetchAllClubs);
app.use('/events', Event);
app.use('/event/manage',router__);
app.use('/forms',formRouter);
app.use('/users', userRoutes);
app.use('/announcements',announcementRouter);
// Start server LAST
app.listen(PORT, () => {
  console.log(`Server connected to port ${PORT}`);
});
