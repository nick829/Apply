const { Client, Intents } = require("discord.js");
const mysql = require("mysql2");
const config = require("./config");

const client = new Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_MEMBERS",
        "MESSAGE_CONTENT"
    ]
});

// DATABASE
const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

con.connect(err => {
    if (err) console.log("DB ERROR:", err);
    else console.log("Database connected.");
});

// GLOBALS
client.config = config;
client.con = con;

// COMMAND HANDLER
client.on("messageCreate", message => {
    require("./messageCreate")(client, message);
});

client.login(config.token);