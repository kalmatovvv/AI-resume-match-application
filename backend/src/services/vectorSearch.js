const { Pool } = require('pg');
// require('pgvector').registerType(require('pg').types);
const { Vector } = require('pgvector');
const { buildFilters } = require('./filters');

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
 * @param {number[]} queryEmbedding - Embedding vector for the query (1024 dimensions for Titan v2)
 * @param {number} limit - Number of results to return (default: 100)
 * @param {object} filters - Optional filters (industry, location, funding_stage, min_similarity)
 * @returns {Promise<Array>} Array of matching companies with similarity scores
 */
async function vectorSearch(queryEmbedding, limit = 100, filters = {}) {
  const dbPool = initPool();
  
  try {
    // Convert embedding array to PostgreSQL vector format
    const embeddingStr = '[' + queryEmbedding.join(',') + ']';

    const { clauses, params: filterParams } = buildFilters(filters);

    // Build dynamic WHERE with filters
    let where = 'WHERE embedding IS NOT NULL';
    if (clauses.length > 0) {
      // Replace placeholder $PARAM with proper parameter indices
      let paramIndex = 2; // $1 is always embedding vector
      const processedClauses = clauses.map((clause) => {
        const replaced = clause.replace(/\$PARAM/g, `$${paramIndex}`);
        paramIndex += 1;
        return replaced;
      });
      where += ' AND ' + processedClauses.join(' AND ');
    }

    const params = [embeddingStr, ...filterParams];
    const limitIndex = params.length + 1;
    params.push(limit);

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
      ${where}
      ORDER BY embedding <=> $1::vector
      LIMIT $${limitIndex}
    `;
    
    const result = await dbPool.query(query, params);
    
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

