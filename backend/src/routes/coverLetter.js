const express = require('express');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const router = express.Router();

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      : undefined
});

async function callTitanText(prompt) {
  const modelId = process.env.BEDROCK_TEXT_MODEL || 'amazon.titan-text-premier-v1:0';

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      inputText: prompt,
      textGenerationConfig: {
        maxTokenCount: 1024,
        temperature: 0.5,
        topP: 0.9
      }
    })
  });

  const response = await bedrockClient.send(command);
  const body = JSON.parse(new TextDecoder().decode(response.body));
  const output = body.results?.[0]?.outputText || '';
  return output;
}

/**
 * POST /api/cover-letter
 * Body: { resumeText: string, jobDescription: string }
 */
router.post('/', async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body || {};

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'resumeText and jobDescription are required' });
    }

    const prompt = `
You are an expert cover letter writer for startup and tech roles.

Write a personalized, one-page cover letter based on:

Candidate resume:
---
${resumeText}
---

Job description:
---
${jobDescription}
---

The tone should be confident, clear, and tailored to the role.
Return only the final cover letter text, ready to paste into an application.
`;

    const letter = await callTitanText(prompt);

    return res.json({
      success: true,
      coverLetter: letter.trim()
    });
  } catch (err) {
    console.error('cover-letter error:', err);
    return res.status(500).json({ error: 'Failed to generate cover letter', message: err.message });
  }
});

module.exports = router;


