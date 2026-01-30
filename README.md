# LaunchPad – Discover Startups

A Reddit-style full-stack web app for discovering and discussing startups. Built with **HTML, CSS, JavaScript, Node.js, Express, and MongoDB**. UI inspired by classic Twitter (blue & white).

## Features

- **Authentication**: JWT-based auth with roles (founder, public user) and secure routes
- **Startup posting**: Founders can add startups with name, logo, one-line pitch, description, funds raised, contact email, and category tags
- **Community**: Reddit-style nested comments, upvote/downvote on startups and comments, follow startups
- **Leaderboard**: Sort by funds raised, most upvoted, or most discussed
- **AI bonus**: Improve your one-line pitch using the OpenAI API (optional)

## Project structure

```
├── backend/
│   ├── config/       # DB connection
│   ├── controllers/  # Auth, startups, comments, leaderboard, AI
│   ├── middleware/   # Auth (JWT), file upload (multer)
│   ├── models/       # User, Startup, Comment
│   ├── routes/       # API routes
│   ├── uploads/      # Local logo uploads
│   └── server.js     # Express app entry
├── public/
│   ├── css/style.css
│   ├── js/
│   │   ├── api.js      # API client
│   │   ├── app.js      # Shared auth & card rendering
│   │   ├── startup.js  # Startup detail page
│   │   └── dashboard.js
│   ├── index.html      # Landing (hero + discover)
│   ├── login.html
│   ├── register.html
│   ├── discover.html
│   ├── leaderboard.html
│   ├── startup.html    # Single startup + comments
│   └── dashboard.html  # Founders: add startup, my startups
├── .env.example
├── package.json
└── README.md
```

## Setup

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **MongoDB**

   Make sure MongoDB is running locally (or use MongoDB Atlas). Default URI: `mongodb://localhost:27017/startup-discovery`.

3. **Environment**

   Copy `.env.example` to `.env` in the project root and set:

   - `PORT` (default 3000)
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `OPENAI_API_KEY` (optional, for “Improve with AI” pitch)

4. **Seed the database (optional)**

   From `backend/`:

   ```bash
   npm run seed
   ```

   This creates 10 users (5 founders, 5 public), 15 startups, comments (including replies), and votes. All seed users have password `password123` (e.g. login: `sarah@example.com` / `password123`).

5. **Run the server**

   From project root:

   ```bash
   node backend/server.js
   ```

   Or from `backend/`: `npm start`

   Open **http://localhost:3000**

## API overview

- `POST /api/auth/register` – Register (body: username, email, password, role)
- `POST /api/auth/login` – Login (email, password)
- `GET /api/auth/me` – Current user (Bearer token)
- `GET /api/startups` – List startups (query: sort, category, search, author=me)
- `GET /api/startups/:id` – One startup
- `POST /api/startups` – Create startup (founder, multipart: logo + fields)
- `PUT /api/startups/:id` – Update startup (author)
- `DELETE /api/startups/:id` – Delete startup (author)
- `POST /api/startups/:id/upvote` | `downvote` | `follow`
- `GET /api/startups/:id/comments` – Nested comments
- `POST /api/startups/:id/comments` – Add comment (body: content, parentId?)
- `POST /api/comments/:id/upvote` | `downvote`
- `GET /api/leaderboard?sort=funds|upvotes|discussed`
- `POST /api/ai/improve-pitch` – Body: currentPitch, context? (requires OPENAI_API_KEY)

## Tech stack

- **Backend**: Express, Mongoose, JWT (jsonwebtoken), bcryptjs, multer (local uploads), OpenAI (optional)
- **Frontend**: Vanilla HTML/CSS/JS, no build step
- **DB**: MongoDB
