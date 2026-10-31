# JanConnect deployment guide (Render)

This repository contains two separate deployables. Deploy the backend as a **Render Web Service** and the frontend as a **Render Static Site**. Do not run the root `npm run build` command for the backend.

## 1. MongoDB Atlas

1. Create a MongoDB Atlas database/cluster.
2. Create a database user and password.
3. In Atlas Network Access, allow connections from Render. For a quick initial test you can allow `0.0.0.0/0`; use stronger network restrictions where practical.
4. Copy the **Drivers** connection string and replace the username, password, and database name. URL-encode special characters in the password.

## 2. Backend — Render Web Service

Create a new **Web Service** from this GitHub repository:

| Setting | Value |
|---|---|
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

Add these Environment Variables in Render (Environment tab):

| Key | Value |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | A long, random secret (at least 32 characters) |
| `CLIENT_URL` | Exact deployed frontend origin, e.g. `https://janconnect-frontend.onrender.com` |
| `ADMIN_EMAIL` | Admin login email you choose |
| `ADMIN_PASSWORD` | A strong initial admin password |
| `NODE_ENV` | `production` |
| `GEMINI_API_KEY` | Optional; only needed for the AI assistant |

`MONGO_URI` must be spelled exactly like that. The server exits at startup if it is missing or the database cannot be reached. `CLIENT_URL` can contain multiple comma-separated frontend origins. Never commit real secrets to GitHub or share them in screenshots.

After saving environment variables, deploy/redeploy the service. Test:
- `https://YOUR-BACKEND.onrender.com/` — should return JSON identifying JanConnect API.
- `https://YOUR-BACKEND.onrender.com/api/health` — should return `success: true`.

## 3. Frontend — Render Static Site

Create a **Static Site** from the same repository:

| Setting | Value |
|---|---|
| Root Directory | `client` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

Add this frontend Environment Variable **before building**:

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://YOUR-BACKEND.onrender.com/api` |

The `/api` suffix is required because the frontend Axios client uses this value as its complete API base URL. Replace the example host with your real Render backend URL. Redeploy the Static Site after changing this variable.

The `client/public/_redirects` file is included so client-side React routes work on Render Static Sites.

## 4. Final checks

1. Open the backend `/api/health` URL and confirm it responds.
2. Open the frontend URL.
3. Test registration/login, complaint creation, complaint details, and admin actions.
4. If browser requests fail, check that `CLIENT_URL` exactly matches the frontend origin (no trailing slash) and `VITE_API_BASE_URL` includes `/api`.

## Important notes

- The backend stores uploaded complaint images in `server/uploads`. Render's ordinary filesystem is ephemeral on free instances; uploaded files may be lost after redeploy/restart. For durable uploads, configure object storage (for example S3-compatible storage) before relying on image retention.
- Render free services can spin down after inactivity, so the first request may take time.
- Do not use the root project's `npm run build` as the backend Build Command. Backend Build Command is `npm install`; Start Command is `npm start`.
- Change the initial admin password immediately after first login.
