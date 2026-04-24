const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());

// -------------------- DATABASE --------------------
const DB = "./applications.json";

function getApps() {
  if (!fs.existsSync(DB)) return [];
  return JSON.parse(fs.readFileSync(DB));
}

function saveApps(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

// -------------------- APPLY API --------------------
app.post("/apply", (req, res) => {
  const { username, discordId, age, reason } = req.body;

  if (!username || !discordId || !age || !reason) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const apps = getApps();

  const newApp = {
    id: Date.now().toString(),
    username,
    discordId,
    age,
    reason,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  apps.push(newApp);
  saveApps(apps);

  res.json({ success: true });
});

// -------------------- GET APPS (BOT USE) --------------------
app.get("/applications", (req, res) => {
  res.json(getApps());
});

// -------------------- ACCEPT / DENY --------------------
app.post("/decision", (req, res) => {
  const { id, status } = req.body;

  const apps = getApps();
  const index = apps.findIndex(a => a.id === id);

  if (index === -1) return res.status(404).json({ error: "Not found" });

  apps[index].status = status;
  saveApps(apps);

  res.json({ success: true });
});

// -------------------- SERVE FRONTEND (THIS FIXES PREVIEW) --------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// -------------------- REPLIT FIX (IMPORTANT) --------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});