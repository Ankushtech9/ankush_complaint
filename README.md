# JanConnect — Citizen Complaint System

A full-stack MERN civic complaint management platform with Citizen, Official and Admin roles.

## Stack

Frontend: React, Vite, React Router
Backend: Node.js, Express.js
Database: MongoDB, Mongoose
Authentication: JWT, bcryptjs
Uploads: Multer
API: REST

## Run

1. Install Node.js 20 or newer.
2. Start MongoDB locally or prepare a MongoDB Atlas connection string.
3. Open the project folder.
4. Run `npm install`.
5. Run `npm run install:all`.
6. Check `server/.env` and set `MONGO_URI` and `JWT_SECRET`.
7. For the Gemini AI complaint helper, copy `server/.env.example` settings into `server/.env` and set `GEMINI_API_KEY` (get a key from Google AI Studio). Keep this key on the server only—never put it in client code or share it publicly.
8. Run `npm run dev`.
8. Open `http://localhost:5173`.

The first server start creates default roles, categories, departments and the admin account from the environment values.

Default admin:

Email: admin@citizen.local
Password: Admin@12345

Change the password after first login.

## Main API

POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
PUT /api/auth/profile
GET /api/complaints
POST /api/complaints
GET /api/complaints/:id
PUT /api/complaints/:id
PATCH /api/complaints/:id/withdraw
PATCH /api/complaints/:id/status
PATCH /api/complaints/:id/assign
GET /api/dashboard/stats
GET /api/categories
POST /api/categories
PUT /api/categories/:id
DELETE /api/categories/:id
GET /api/departments
POST /api/departments
PUT /api/departments/:id
DELETE /api/departments/:id
GET /api/users
PATCH /api/users/:id
GET /api/notifications
PATCH /api/notifications/:id/read
GET /api/activity-logs


## JanConnect AI complaint assistant

On the citizen complaint form, the Gemini-powered assistant helps people describe civic issues in Hindi, Hinglish, or English and drafts the complaint fields. Supported browsers can also use Hindi voice input. The citizen can edit every suggested field and must submit the complaint manually; the AI never submits it automatically. The server route is `POST /api/ai/complaint-assistant` and requires a signed-in citizen account.

To enable it, add `GEMINI_API_KEY=your_key_here` to `server/.env`. The key is used only by the server. If it is missing, the app shows a configuration message and the regular complaint form continues to work. Do not put real API keys in source control. Voice input depends on browser speech-recognition support and may require internet access.
<<<<<<< HEAD


## Render deployment

See [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md) for exact Render Web Service, Static Site, MongoDB Atlas, and environment variable settings.
=======
>>>>>>> 39148f81eadb3bfdcdb2e3b6911a75ded6ffce4f
