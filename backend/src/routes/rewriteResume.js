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
        temperature: 0.4,
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
 * POST /api/rewrite-resume
 * Body: { rawText: string, style: "professional" | "concise" | "technical" }
 */
router.post('/', async (req, res) => {
  try {
    const { rawText, style = 'professional' } = req.body || {};

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return res.status(400).json({ error: 'rawText is required' });
    }

    const styleLabel = ['professional', 'concise', 'technical'].includes(style)
      ? style
      : 'professional';

    const prompt = `
You are an expert resume writer and ATS optimization assistant.

Rewrite the following resume content in a ${styleLabel} tone.
Make it clear, impact-focused, and suitable for US startup / tech roles.

Return ONLY valid JSON with the following shape:
{
  "rewritten": "full rewritten resume text",
  "bullets": ["bullet 1", "bullet 2", "..."]
}

Resume text:
---
${rawText}
---
`;

    const rawOutput = await callTitanText(prompt);

    let parsed;
    try {
      parsed = JSON.parse(rawOutput);
    } catch {
      // Fallback: wrap raw text
      parsed = {
        rewritten: rawOutput.trim(),
        bullets: []
      };
    }

    return res.json({
      success: true,
      rewritten: parsed.rewritten || '',
      bullets: Array.isArray(parsed.bullets) ? parsed.bullets : []
    });
  } catch (err) {
    console.error('rewrite-resume error:', err);
    return res.status(500).json({ error: 'Failed to rewrite resume', message: err.message });
  }
});

module.exports = router;


