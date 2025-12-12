# Rebuilding Docker Container with Latest Code

## Quick Rebuild (if using volume mounts)

Since `docker-compose.yml` has volume mounts for `./src`, you can just restart:

```bash
cd backend
docker-compose restart backend
```

However, if you added new dependencies (like `jose`, `cookie-parser`), you need a full rebuild.

## Full Rebuild (recommended)

1. **Stop and remove containers:**
   ```bash
   cd backend
   docker-compose down
   ```

2. **Rebuild the image with latest code:**
   ```bash
   docker-compose build --no-cache backend
   ```

3. **Start everything:**
   ```bash
   docker-compose up -d
   ```

4. **Check logs to verify it's working:**
   ```bash
   docker-compose logs -f backend
   ```

   You should see: `Server running on port 3000`
   And when you make a request: `[optionalJwt] Cognito not configured, allowing unauthenticated access`

## Alternative: Use Local Dev Server (Easier for Development)

Instead of Docker, run the backend locally:

```bash
cd backend
npm install  # Make sure all dependencies are installed
npm run dev  # Runs on localhost:3001 with nodemon (auto-reload)
```

Your frontend Vite config already points to `localhost:3001`, so this should work immediately.






