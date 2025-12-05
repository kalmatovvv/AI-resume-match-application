const express = require('express');
const extractResume = require('../services/extractResume');
const generateEmbedding = require('../services/embeddings');
const vectorSearch = require('../services/vectorSearch');
const multer = require('multer');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
    }
  }
});

/**
 * POST /api/match
 * Upload resume, generate embedding, and return top 100 matching companies
 * Supports optional filters via multipart field "filters" (JSON string):
 * {
 *   "industry": string[],
 *   "location": string[],
 *   "funding_stage": string[],
 *   "min_similarity": number
 * }
 */
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { buffer, mimetype } = req.file;

    // Optional filters passed as JSON string in multipart body
    let filters = {};
    if (req.body && req.body.filters) {
      try {
        filters = JSON.parse(req.body.filters);
      } catch {
        return res.status(400).json({ error: 'Invalid filters JSON' });
      }
    }
    
    // Step 1: Extract text from resume
    console.log('Extracting text from resume...');
    const resumeText = await extractResume(buffer, mimetype);
    
    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from resume' });
    }

    // Step 2: Generate embedding for resume
    console.log('Generating embedding for resume...');
    const resumeEmbedding = await generateEmbedding(resumeText);
    
    if (!resumeEmbedding || resumeEmbedding.length === 0) {
      return res.status(500).json({ error: 'Failed to generate embedding' });
    }

    // Step 3: Search for matching companies with optional filters
    // Limit to 3 results for unauthenticated users, 100 for authenticated
    const isAuthenticated = !!req.user;
    const limit = isAuthenticated ? 100 : 3;
    console.log(`Searching for matching companies (limit: ${limit}, authenticated: ${isAuthenticated})...`);
    const topMatches = await vectorSearch(resumeEmbedding, limit, filters);
    
    res.json({
      success: true,
      matches: topMatches,
      count: topMatches.length,
      authenticated: isAuthenticated,
      limit: limit
    });
  } catch (error) {
    console.error('Match error:', error);
    res.status(500).json({ 
      error: 'Failed to find matches', 
      message: error.message 
    });
  }
});

/**
 * POST /api/match/text
 * Match using plain text (for testing)
 * Body:
 * {
 *   "text": string,
 *   "filters"?: { ...same as /api/match... }
 * }
 */
router.post('/text', async (req, res) => {
  try {
    const { text, filters = {} } = req.body || {};
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'No text provided' });
    }

    // Generate embedding
    const textEmbedding = await generateEmbedding(text);
    
    if (!textEmbedding || textEmbedding.length === 0) {
      return res.status(500).json({ error: 'Failed to generate embedding' });
    }

    // Search for matches with optional filters
    // Limit to 3 results for unauthenticated users, 100 for authenticated
    const isAuthenticated = !!req.user;
    const limit = isAuthenticated ? 100 : 3;
    const topMatches = await vectorSearch(textEmbedding, limit, filters);
    
    res.json({
      success: true,
      matches: topMatches,
      count: topMatches.length,
      authenticated: isAuthenticated,
      limit: limit
    });
  } catch (error) {
    console.error('Match error:', error);
    res.status(500).json({ 
      error: 'Failed to find matches', 
      message: error.message 
    });
  }
});

module.exports = router;

