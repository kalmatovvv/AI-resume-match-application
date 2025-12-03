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
 * Upload resume, generate embedding, and return top 10 matching companies
 */
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { buffer, mimetype } = req.file;
    
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

    // Step 3: Search for top 100 matching companies
    console.log('Searching for matching companies...');
    const topMatches = await vectorSearch(resumeEmbedding, 100);
    
    res.json({
      success: true,
      matches: topMatches,
      count: topMatches.length
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
 */
router.post('/text', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'No text provided' });
    }

    // Generate embedding
    const textEmbedding = await generateEmbedding(text);
    
    if (!textEmbedding || textEmbedding.length === 0) {
      return res.status(500).json({ error: 'Failed to generate embedding' });
    }

    // Search for matches
    const topMatches = await vectorSearch(textEmbedding, 100);
    
    res.json({
      success: true,
      matches: topMatches,
      count: topMatches.length
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

