const { Client, Intents, Collection } = require("discord.js");
const mysql = require("mysql2");
const config = require("./config");
const loader = require("./handler/loader");

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.MESSAGE_CONTENT
    ]
});

// ======================
// GLOBALS
// ======================
client.commands = new Collection();
client.aliases = new Collection();
client.config = config;

// ======================
// DATABASE
// ======================
client.con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

client.con.connect(err => {
    if (err) console.log("DB ERROR:", err);
    else console.log("Database connected.");
});

// ======================
// LOAD COMMANDS
// ======================
loader(client);

// ======================
// MESSAGE HANDLER
// ======================
client.on("messageCreate", require("./events/messageCreate"));

client.login(config.token);