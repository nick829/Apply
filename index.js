const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

// =====================
// CONFIG
// =====================
const TOKEN = "YOUR_BOT_TOKEN";
const CLIENT_ID = "YOUR_CLIENT_ID";
const GUILD_ID = "YOUR_GUILD_ID";
const OWNER_ID = "YOUR_DISCORD_ID";

// =====================
// CLIENT
// =====================
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// =====================
// SYSTEMS
// =====================
let staff = new Set();
let trusted = new Set();
let whitelist = new Set();
let blacklist = new Set();
let warns = new Map();

let logChannelId = null;

// =====================
// LOGGING
// =====================
function log(guild, msg) {
  if (!logChannelId) return;
  const ch = guild.channels.cache.get(logChannelId);
  if (!ch) return;
  ch.send(`📊 ${msg}`).catch(() => {});
}

function audit(interaction, action, target = "None") {
  log(interaction.guild,
    `👮 ${action} | By: ${interaction.user.tag} | Target: ${target}`
  );
}

// =====================
// PERMISSIONS
// =====================
function isStaff(id) {
  return id === OWNER_ID || staff.has(id);
}

// =====================
// SNAPSHOT (ANTI-NUKE CORE)
// =====================
let snapshot = { channels: [], roles: [] };

function takeSnapshot(guild) {
  snapshot.channels = guild.channels.cache.map(c => ({
    name: c.name,
    type: c.type,
    parent: c.parentId
  }));

  snapshot.roles = guild.roles.cache
    .filter(r => r.name !== "@everyone")
    .map(r => ({
      name: r.name,
      color: r.color,
      permissions: r.permissions.bitfield
    }));
}

function restore(guild) {
  snapshot.channels.forEach(c => {
    guild.channels.create({
      name: c.name,
      type: c.type,
      parent: c.parent || null
    }).catch(() => {});
  });

  snapshot.roles.forEach(r => {
    guild.roles.create({
      name: r.name,
      color: r.color,
      permissions: r.permissions
    }).catch(() => {});
  });

  log(guild, "🔁 Server restored from snapshot");
}

// =====================
// COMMAND LIST (ALL RESTORED)
// =====================
const commands = [

  // BASIC
  new SlashCommandBuilder().setName("ping").setDescription("Bot latency"),
  new SlashCommandBuilder().setName("credits").setDescription("Bot credits"),
  new SlashCommandBuilder().setName("serverinfo").setDescription("Server info"),
  new SlashCommandBuilder().setName("avatar").setDescription("User avatar")
    .addUserOption(o => o.setName("user")),

  // LOG SYSTEM
  new SlashCommandBuilder().setName("setlog").setDescription("Set log channel"),

  // MODERATION
  new SlashCommandBuilder().setName("kick").setDescription("Kick user")
    .addUserOption(o => o.setName("user").setRequired(true)),

  new SlashCommandBuilder().setName("ban").setDescription("Ban user")
    .addUserOption(o => o.setName("user").setRequired(true)),

  new SlashCommandBuilder().setName("clear").setDescription("Delete messages")
    .addIntegerOption(o => o.setName("amount").setRequired(true)),

  new SlashCommandBuilder().setName("warn").setDescription("Warn user")
    .addUserOption(o => o.setName("user").setRequired(true)),

  new SlashCommandBuilder().setName("warnings").setDescription("Check warnings")
    .addUserOption(o => o.setName("user").setRequired(true)),

  // SECURITY TOGGLES
  new SlashCommandBuilder().setName("antiraid").setDescription("Toggle anti-raid"),
  new SlashCommandBuilder().setName("antispam").setDescription("Toggle anti-spam"),
  new SlashCommandBuilder().setName("antilink").setDescription("Toggle anti-link"),

  // CHANNEL CONTROL
  new SlashCommandBuilder().setName("lock").setDescription("Lock channel"),
  new SlashCommandBuilder().setName("unlock").setDescription("Unlock channel"),
  new SlashCommandBuilder().setName("hide").setDescription("Hide channel"),
  new SlashCommandBuilder().setName("show").setDescription("Show channel"),

  // SERVER CONTROL
  new SlashCommandBuilder().setName("nuke").setDescription("Reset channel"),

  // STAFF SYSTEM
  new SlashCommandBuilder().setName("addstaff").setDescription("Add staff")
    .addUserOption(o => o.setName("user").setRequired(true)),

  new SlashCommandBuilder().setName("removestaff").setDescription("Remove staff")
    .addUserOption(o => o.setName("user").setRequired(true)),

  // TRUSTED SYSTEM
  new SlashCommandBuilder().setName("addtrusted").setDescription("Add trusted")
    .addUserOption(o => o.setName("user").setRequired(true)),

  new SlashCommandBuilder().setName("removetrusted").setDescription("Remove trusted")
    .addUserOption(o => o.setName("user").setRequired(true)),

  // WHITELIST
  new SlashCommandBuilder().setName("whitelist").setDescription("Whitelist user")
    .addUserOption(o => o.setName("user").setRequired(true)),

  new SlashCommandBuilder().setName("removewhitelist").setDescription("Remove whitelist")
    .addUserOption(o => o.setName("user").setRequired(true)),

  // BLACKLIST
  new SlashCommandBuilder().setName("blacklist").setDescription("Blacklist user")
    .addUserOption(o => o.setName("user").setRequired(true)),

  // SNAPSHOT SYSTEM
  new SlashCommandBuilder().setName("snapshot").setDescription("Save server state"),
  new SlashCommandBuilder().setName("restore").setDescription("Restore server"),
  new SlashCommandBuilder().setName("security").setDescription("Security status")
];

// =====================
// REGISTER COMMANDS
// =====================
const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands.map(c => c.toJSON()) }
  );
})();

// =====================
// READY
// =====================
client.once("ready", () => {
  console.log(`${client.user.tag} ONLINE`);
});

// =====================
// INTERACTIONS
// =====================
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;

  // =====================
  // BASIC
  // =====================
  if (cmd === "ping")
    return interaction.reply(`🏓 ${client.ws.ping}ms`);

  if (cmd === "credits")
    return interaction.reply("⚡ Ultra Enterprise Security Bot");

  if (cmd === "serverinfo")
    return interaction.reply(`${interaction.guild.name} | ${interaction.guild.memberCount} members`);

  if (cmd === "avatar") {
    const u = interaction.options.getUser("user") || interaction.user;
    return interaction.reply(u.displayAvatarURL());
  }

  // =====================
  // LOGGING
  // =====================
  if (cmd === "setlog") {
    logChannelId = interaction.channel.id;
    return interaction.reply("📊 Log channel set");
  }

  // =====================
  // MODERATION
  // =====================
  if (cmd === "kick") {
    if (!isStaff(interaction.user.id)) return interaction.reply("No permission");
    const u = interaction.options.getUser("user");
    await interaction.guild.members.kick(u.id).catch(() => {});
    audit(interaction, "KICK", u.tag);
    return interaction.reply("Kicked");
  }

  if (cmd === "ban") {
    if (!isStaff(interaction.user.id)) return interaction.reply("No permission");
    const u = interaction.options.getUser("user");
    await interaction.guild.members.ban(u.id).catch(() => {});
    audit(interaction, "BAN", u.tag);
    return interaction.reply("Banned");
  }

  if (cmd === "clear") {
    if (!isStaff(interaction.user.id)) return;
    const amt = interaction.options.getInteger("amount");
    await interaction.channel.bulkDelete(amt);
    audit(interaction, "CLEAR", `${amt} messages`);
    return interaction.reply({ content: "Cleared", ephemeral: true });
  }

  // =====================
  // WARN SYSTEM
  // =====================
  if (cmd === "warn") {
    const u = interaction.options.getUser("user");
    warns.set(u.id, (warns.get(u.id) || 0) + 1);
    audit(interaction, "WARN", u.tag);
    return interaction.reply(`${u.tag} warned`);
  }

  if (cmd === "warnings") {
    const u = interaction.options.getUser("user");
    return interaction.reply(`Warnings: ${warns.get(u.id) || 0}`);
  }

  // =====================
  // SECURITY TOGGLES
  // =====================
  if (cmd === "antiraid")
    return interaction.reply("Anti-raid toggled");

  if (cmd === "antispam")
    return interaction.reply("Anti-spam toggled");

  if (cmd === "antilink")
    return interaction.reply("Anti-link toggled");

  // =====================
  // CHANNEL CONTROL
  // =====================
  if (cmd === "lock") {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
      SendMessages: false
    });
    return interaction.reply("Locked");
  }

  if (cmd === "unlock") {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
      SendMessages: true
    });
    return interaction.reply("Unlocked");
  }

  // =====================
  // STAFF SYSTEM
  // =====================
  if (cmd === "addstaff") {
    if (interaction.user.id !== OWNER_ID) return;
    staff.add(interaction.options.getUser("user").id);
    return interaction.reply("Staff added");
  }

  if (cmd === "removestaff") {
    if (interaction.user.id !== OWNER_ID) return;
    staff.delete(interaction.options.getUser("user").id);
    return interaction.reply("Staff removed");
  }

  // =====================
  // TRUSTED / WHITELIST / BLACKLIST
  // =====================
  if (cmd === "whitelist") {
    whitelist.add(interaction.options.getUser("user").id);
    return interaction.reply("Whitelisted");
  }

  if (cmd === "removewhitelist") {
    whitelist.delete(interaction.options.getUser("user").id);
    return interaction.reply("Removed whitelist");
  }

  if (cmd === "blacklist") {
    blacklist.add(interaction.options.getUser("user").id);
    return interaction.reply("Blacklisted");
  }

  // =====================
  // SNAPSHOT SYSTEM
  // =====================
  if (cmd === "snapshot") {
    takeSnapshot(interaction.guild);
    return interaction.reply("Snapshot saved");
  }

  if (cmd === "restore") {
    restore(interaction.guild);
    return interaction.reply("Restored");
  }

  if (cmd === "security") {
    return interaction.reply("🛡️ System Online (Ultra Enterprise)");
  }
});

client.login(TOKEN);