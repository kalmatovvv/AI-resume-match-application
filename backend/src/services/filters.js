/**
 * Build SQL WHERE fragments and parameters from filters object.
 * Supported filters:
 * - industry?: string[]
 * - location?: string[]
 * - funding_stage?: string[] (mapped to latest_funding)
 * - min_similarity?: number (0..1)
 */
function buildFilters(filters = {}) {
  const clauses = [];
  const params = [];

  if (Array.isArray(filters.industry) && filters.industry.length > 0) {
    clauses.push(`industry = ANY($PARAM::text[])`);
    params.push(filters.industry);
  }

  if (Array.isArray(filters.location) && filters.location.length > 0) {
    clauses.push(`location = ANY($PARAM::text[])`);
    params.push(filters.location);
  }

  if (Array.isArray(filters.funding_stage) && filters.funding_stage.length > 0) {
    // Map funding_stage to latest_funding column
    clauses.push(`latest_funding = ANY($PARAM::text[])`);
    params.push(filters.funding_stage);
  }

  if (typeof filters.min_similarity === 'number') {
    // similarity = 1 - (embedding <=> $1::vector)
    // condition: similarity >= min_similarity
    // => (embedding <=> $1::vector) <= (1 - min_similarity)
    const threshold = 1 - filters.min_similarity;
    clauses.push(`(embedding <=> $1::vector) <= $PARAM::double precision`);
    params.push(threshold);
  }

  return { clauses, params };
}

module.exports = {
  buildFilters
};


