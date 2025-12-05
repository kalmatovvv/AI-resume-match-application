const cache = {
  jwks: null,
  expiresAt: 0
};

async function fetchJwks(jwksUrl) {
  const now = Date.now();

  if (cache.jwks && cache.expiresAt > now) {
    return cache.jwks;
  }

  const res = await fetch(jwksUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch JWKS from Cognito: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  cache.jwks = data;
  // cache for 1 hour
  cache.expiresAt = now + 60 * 60 * 1000;
  return data;
}

module.exports = {
  fetchJwks
};


