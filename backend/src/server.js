const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const uploadRoutes = require('./routes/upload');
const matchRoutes = require('./routes/match');
const rewriteResumeRoutes = require('./routes/rewriteResume');
const coverLetterRoutes = require('./routes/coverLetter');
const { verifyJwt, optionalJwt } = require('./auth/verifyJwt');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/upload', uploadRoutes);
// Match route uses optional JWT - allows unauthenticated access (limited to 3 results)
// but verifies token if present (allows 100 results)
app.use('/api/match', optionalJwt, matchRoutes);
// AI tools require authentication
app.use('/api/rewrite-resume', verifyJwt, rewriteResumeRoutes);
app.use('/api/cover-letter', verifyJwt, coverLetterRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Resume Match API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

