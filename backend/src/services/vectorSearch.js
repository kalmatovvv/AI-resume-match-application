const { Pool } = require('pg');
// require('pgvector').registerType(require('pg').types);
const { Vector } = require('pgvector');

let pool = null;

/**
 * Initialize database connection pool
 */
function initPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'resume_match',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

/**
 * Search for top N matching companies using vector similarity
 * @param {number[]} queryEmbedding - Embedding vector for the query (1536 dimensions for Titan v2)
 * @param {number} limit - Number of results to return (default: 100)
 * @returns {Promise<Array>} Array of matching companies with similarity scores
 */
async function vectorSearch(queryEmbedding, limit = 100) {
  const dbPool = initPool();
  
  try {
    // Convert embedding array to PostgreSQL vector format
    const embeddingStr = '[' + queryEmbedding.join(',') + ']';
    
    const query = `
      SELECT 
        company_name,
        founded_year,
        location,
        industry,
        latest_funding,
        website,
        linkedin,
        description,
        embedding_text,
        1 - (embedding <=> $1::vector) as similarity
      FROM companies
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector
      LIMIT $2
    `;
    
    const result = await dbPool.query(query, [embeddingStr, limit]);
    
    return result.rows.map(row => ({
      company_name: row.company_name,
      founded_year: row.founded_year,
      location: row.location,
      industry: row.industry,
      latest_funding: row.latest_funding,
      website: row.website,
      linkedin: row.linkedin,
      description: row.description,
      similarity: parseFloat(row.similarity)
    }));
  } catch (error) {
    console.error('Vector search error:', error);
    throw new Error('Failed to perform vector search');
  }
}

/**
 * Close database connection pool
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = vectorSearch;
module.exports.closePool = closePool;
module.exports.initPool = initPool;

