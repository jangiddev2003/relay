# Relay — Multi-Bot AI Assistant Platform

A full-stack web app with 5 specialist AI bots (Knowledge, Reasoning, Coding,
Maths, News), user accounts, persistent per-user chat history, and one-click
PDF / Word export of any conversation.

## Stack
- **Frontend:** Next.js + React + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT in an httpOnly cookie + bcrypt password hashing
- **AI:** Google Gemini API (free tier)
- **News data:** NewsAPI.org

## Project structure
```
relay/
├── server/   → Express API (auth, bots, database models)
└── client/   → Next.js frontend (login, signup, chat UI)
```

## 1. Set up the database
1. Create a free MongoDB Atlas cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user and allow your IP (or 0.0.0.0/0 for local dev)
3. Copy your connection string — you'll need it in step 3

## 2. Get your API keys
- **Gemini:** https://aistudio.google.com/ → create an API key (free tier)
- **NewsAPI:** https://newsapi.org/ → sign up → copy your API key (free tier)

## 3. Configure the backend
```bash
cd server
cp .env.example .env
# open .env and fill in MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, NEWS_API_KEY
npm install
npm run dev
```
The server runs on http://localhost:5000 by default. JWT_SECRET can be any
long random string — generate one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 4. Configure the frontend
```bash
cd client
cp .env.local.example .env.local
npm install
npm run dev
```
The frontend runs on http://localhost:3000 by default.

## 5. Use it
Open http://localhost:3000 → sign up → pick a bot from the sidebar → chat →
export the conversation as PDF or Word from the buttons under the message box.

## Notes
- Requires **Node.js 18+** (uses the built-in `fetch`).
- The AI API key never touches the browser — all AI calls happen on the
  server, which is the correct/safe pattern.
- A simple in-memory rate limiter caps each user at 20 messages/hour per bot
  to protect your free-tier API quota. Resets on server restart — fine for
  development, swap for a persistent store (e.g. Redis) before real production use.
- Document export runs entirely in the browser (jsPDF for PDF, an HTML/Blob
  trick for Word) — no extra backend work needed.

## Suggested next steps
- Add the remaining bots (Sports, Entertainment, Image) following the same
  pattern in `server/utils/botConfig.js` and `server/routes/chat.js`.
- Add streaming responses for a more "live typing" feel.
- Move the rate limiter to Redis if deploying with multiple server instances.
