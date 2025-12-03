const OpenAI = require('openai');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

// Initialize clients based on configuration
let openaiClient = null;
let bedrockClient = null;

// Initialize OpenAI if API key is provided
if (process.env.OPENAI_API_KEY) {
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Initialize Bedrock if AWS credentials are provided
if (process.env.AWS_REGION) {
  bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    } : undefined
  });
}

/**
 * Generate embedding for text using OpenAI or AWS Bedrock
 * @param {string} text - Text to generate embedding for
 * @returns {Promise<number[]>} Embedding vector
 */
async function generateEmbedding(text) {
  const provider = process.env.EMBEDDING_PROVIDER || 'bedrock';
  const EXPECTED_DIMENSIONS = 1536; // Titan v2 dimensions
  
  let embedding;
  
  if (provider === 'openai') {
    embedding = await generateOpenAIEmbedding(text);
  } else if (provider === 'bedrock') {
    embedding = await generateBedrockEmbedding(text);
  } else {
    throw new Error(`Unsupported embedding provider: ${provider}`);
  }
  
  // Final validation: Ensure embedding has correct dimensions
  if (!embedding || !Array.isArray(embedding)) {
    throw new Error('Invalid embedding format: embedding must be an array');
  }
  
  if (embedding.length !== EXPECTED_DIMENSIONS) {
    throw new Error(
      `Embedding dimension mismatch: expected ${EXPECTED_DIMENSIONS}, got ${embedding.length}. ` +
      `Provider: ${provider}`
    );
  }
  
  return embedding;
}

/**
 * Generate embedding using OpenAI
 * @param {string} text - Text to generate embedding for
 * @returns {Promise<number[]>} Embedding vector
 */
async function generateOpenAIEmbedding(text) {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Set OPENAI_API_KEY environment variable.');
  }

  try {
    const model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
    
    const response = await openaiClient.embeddings.create({
      model: model,
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('OpenAI embedding error:', error);
    throw new Error('Failed to generate OpenAI embedding');
  }
}

/**
 * Generate embedding using AWS Bedrock (Titan Embeddings)
 * @param {string} text - Text to generate embedding for
 * @returns {Promise<number[]>} Embedding vector
 */

// Add this helper at the top of embeddings.js
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateBedrockEmbedding(text) {
  if (!bedrockClient) {
    throw new Error('Bedrock client not initialized. Set AWS_REGION environment variable.');
  }

  // CRITICAL: Always use Titan v2 (1536 dimensions)
  const modelId = 'amazon.titan-embed-text-v2:0';
  const EXPECTED_DIMENSIONS = 1536;
  
  // Prepare input - Note: This structure works for Titan. 
  // If using strictly "Nova", the payload keys might differ.
  const input = {
    modelId: modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      inputText: text
    })
  };

  const command = new InvokeModelCommand(input);

  // --- RETRY LOGIC STARTS HERE ---
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      const response = await bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      // Titan returns 'embedding', some models return 'embeddings'
      const embedding = responseBody.embedding || responseBody.embeddings?.[0];
      
      // CRITICAL: Validate embedding dimensions
      if (!embedding || !Array.isArray(embedding)) {
        throw new Error('Invalid embedding format received from Bedrock');
      }
      
      if (embedding.length !== EXPECTED_DIMENSIONS) {
        throw new Error(
          `Embedding dimension mismatch: expected ${EXPECTED_DIMENSIONS}, got ${embedding.length}. ` +
          `Model: ${modelId}`
        );
      }
      
      return embedding;

    } catch (error) {
      // Check for Throttling (429)
      if (error.name === 'ThrottlingException' || error.$metadata?.httpStatusCode === 429) {
        attempts++;
        const waitTime = Math.pow(2, attempts) * 1000; // 2s, 4s, 8s...
        console.warn(`AWS Bedrock Throttled. Retrying attempt ${attempts}/${maxAttempts} in ${waitTime}ms...`);
        await sleep(waitTime);
      } else {
        // If it's a real error (like permissions or dimension mismatch), fail immediately
        console.error('Bedrock embedding error:', error);
        throw error;
      }
    }
  }
  // --- RETRY LOGIC ENDS HERE ---

  throw new Error(`Failed to generate Bedrock embedding after ${maxAttempts} attempts`);
}
module.exports = generateEmbedding;

