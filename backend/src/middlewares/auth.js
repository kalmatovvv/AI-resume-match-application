const { CognitoJwtVerifier } = require("aws-jwt-verify");

// Create the verifier
// We make it lazy or separate to avoid issues during module load if env vars are missing? 
// No, standard is to create it once.
const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    tokenUse: "access",
    clientId: process.env.COGNITO_CLIENT_ID,
});

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
        }

        const token = authHeader.split(" ")[1];

        // verify() throws if invalid
        const payload = await verifier.verify(token);

        req.user = {
            sub: payload.sub,
            username: payload.username,
            ...payload
        };

        next();
    } catch (err) {
        console.error("Token verification failed:", err.message);
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};

const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const payload = await verifier.verify(token);
            req.user = {
                sub: payload.sub,
                username: payload.username,
                ...payload
            };
        }
        next();
    } catch (err) {
        // If token is invalid, just proceed as unauthenticated
        // But maybe log it
        console.warn("Optional auth failed:", err.message);
        next();
    }
};

module.exports = { authMiddleware, optionalAuthMiddleware };
