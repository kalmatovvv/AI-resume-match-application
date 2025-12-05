const { jwtVerify, createLocalJWKSet } = require('jose');
const { fetchJwks } = require('./cognitoJwksCache');

/**
 * Build Cognito JWKS URL from env if not provided directly.
 */
function getJwksUrl() {
  if (process.env.COGNITO_JWKS_URL) {
    return process.env.COGNITO_JWKS_URL;
  }
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const region = process.env.AWS_REGION;

  if (!userPoolId || !region) {
    throw new Error('COGNITO_JWKS_URL or (COGNITO_USER_POOL_ID and AWS_REGION) must be set');
  }

  return `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
}

async function verifyToken(token) {
  const jwksUrl = getJwksUrl();
  const jwks = await fetchJwks(jwksUrl);
  const jwkSet = createLocalJWKSet(jwks);

  const audience = process.env.COGNITO_CLIENT_ID || process.env.COGNITO_USER_POOL_CLIENT_ID;
  const issuer = jwksUrl.replace('/.well-known/jwks.json', '');

  const { payload } = await jwtVerify(token, jwkSet, {
    issuer,
    audience
  });

  return payload;
}

/**
 * Express middleware to require a valid Cognito JWT.
 * Looks for:
 * - Authorization: Bearer <token>
 * - or cookie named "idToken"
 */
async function verifyJwt(req, res, next) {
  try {
    let token = null;

    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring('Bearer '.length);
    }

    if (!token && req.cookies && req.cookies.idToken) {
      token = req.cookies.idToken;
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: missing token' });
    }

    const payload = await verifyToken(token);
    req.user = {
      sub: payload.sub,
      email: payload.email,
      username: payload['cognito:username'],
      payload
    };

    return next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({ error: 'Unauthorized: invalid token' });
  }
}

/**
 * Optional JWT middleware - verifies token if present, but allows unauthenticated access.
 * Useful for local development when Cognito isn't set up yet.
 * Sets req.user if token is valid, otherwise req.user is undefined.
 */
async function optionalJwt(req, res, next) {
  // Check if Cognito is configured
  const hasCognitoConfig = 
    process.env.COGNITO_JWKS_URL || 
    (process.env.COGNITO_USER_POOL_ID && process.env.AWS_REGION);
  
  // Skip auth entirely if Cognito isn't configured (local dev)
  if (!hasCognitoConfig) {
    // In dev mode without Cognito, allow unauthenticated access
    console.log('[optionalJwt] Cognito not configured, allowing unauthenticated access');
    req.user = undefined;
    return next();
  }

  // If Cognito is configured, try to verify token but don't require it
  try {
    let token = null;

    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring('Bearer '.length);
    }

    if (!token && req.cookies && req.cookies.idToken) {
      token = req.cookies.idToken;
    }

    if (token) {
      try {
        const payload = await verifyToken(token);
        req.user = {
          sub: payload.sub,
          email: payload.email,
          username: payload['cognito:username'],
          payload
        };
        console.log('[optionalJwt] Token verified, user authenticated:', req.user.email);
      } catch (err) {
        // Token present but invalid - still allow request but mark as unauthenticated
        console.warn('[optionalJwt] Invalid token provided, allowing unauthenticated access:', err.message);
        req.user = undefined;
      }
    } else {
      console.log('[optionalJwt] No token provided, allowing unauthenticated access');
      req.user = undefined;
    }
  } catch (err) {
    // If JWKS fetch fails, allow unauthenticated access
    console.warn('JWKS fetch failed, allowing unauthenticated access:', err.message);
    req.user = undefined;
  }

  return next();
}

module.exports = {
  optionalJwt, 
  verifyJwt,
};


