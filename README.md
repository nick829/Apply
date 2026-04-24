# 🌐 Apply Bot Dashboard System

A futuristic Discord application system with a web dashboard, backend API, and Discord bot integration for managing staff applications.

---

## ✨ Features

- 3-step futuristic application UI
- Discord Username + Discord ID system
- Instant application submission
- Discord bot posts applications in staff channel
- Accept / Deny buttons
- Live status tracking (pending / accepted / denied)
- Simple JSON database (no setup needed)
- Express backend API
- Clean neon-style UI

---

## 🧱 Project Files

- server.js → Backend API (Express)
- index.html → Application website
- bot.js → Discord bot (discord.js v14)
- applications.json → Database storage
- package.json → Dependencies

---

## ⚙️ Setup

### Install dependencies
npm install

---

### Start backend
node server.js

---

### Start bot (new terminal)
node bot.js

---

## 🔐 Bot Configuration

Edit bot.js:

const TOKEN = "YOUR_BOT_TOKEN";
const CHANNEL_ID = "YOUR_CHANNEL_ID";
const API = "http://localhost:3000";

---

## 📡 How It Works

1. User opens apply website
2. Fills form:
   - Discord Username
   - Discord ID
   - Age
   - Reason
3. Data sent to backend (/apply)
4. Stored in applications.json
5. Bot fetches applications
6. Bot posts embed in Discord
7. Staff click:
   - Accept → approve application
   - Deny → reject application

---

## 📁 API Routes

POST /apply → submit application  
GET /applications → get all applications  
POST /decision → accept/deny application  

---

## 🛡️ Security

- Never expose bot token
- Keep API private in production
- Use environment variables for hosting

---

## 🚀 Deployment

Replit:
- Run server.js
- Run bot.js in another shell

VPS:
npm install pm2 -g
pm2 start server.js
pm2 start bot.js

---

## 💡 Future Upgrades

- Discord OAuth login
- Admin dashboard panel
- MongoDB database support
- Auto role assignment
- Ticket system integration
- Live updates (no refresh needed)

---

## ⚡ Status

Active working system