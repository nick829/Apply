const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const DATA_FILE = "./applications.json";

// Load apps
function loadApps() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

// Save apps
function saveApps(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Apply endpoint
app.post("/apply", (req, res) => {
  const { username, discordId, age, reason } = req.body;

  if (!username || !discordId || !age || !reason) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const apps = loadApps();

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

  res.json({ success: true, app: newApp });
});

// Get applications (bot uses this)
app.get("/applications", (req, res) => {
  res.json(loadApps());
});

// Accept / deny
app.post("/decision", (req, res) => {
  const { id, status } = req.body;

  const apps = loadApps();
  const index = apps.findIndex(a => a.id === id);

  if (index === -1) return res.status(404).json({ error: "Not found" });

  apps[index].status = status;
  saveApps(apps);

  res.json({ success: true });
});

app.listen(3000, () => console.log("Server running on port 3000"));