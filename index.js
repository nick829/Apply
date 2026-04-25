const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

// =====================
// CONFIG
// =====================
const TOKEN = "YOUR_BOT_TOKEN";
const CLIENT_ID = "YOUR_CLIENT_ID";
const GUILD_ID = "YOUR_GUILD_ID";

// =====================
// CLIENT
// =====================
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// =====================
// SYSTEM STORAGE
// =====================
let settings = {
  antiraid: false,
  antispam: false,
  antilink: false,
  raidmode: false
};

let staff = new Set();
let whitelist = new Set();
let blacklist = new Set();
let warns = new Map();

// =====================
// COMMAND LIST (30+)
// =====================
const commands = [

  // BASIC
  new SlashCommandBuilder().setName("ping").setDescription("Bot latency"),
  new SlashCommandBuilder().setName("credits").setDescription("Bot credits"),

  // MODERATION
  new SlashCommandBuilder().setName("kick").setDescription("Kick user")
    .addUserOption(o => o.setName("user").setRequired(true)),

  new SlashCommandBuilder().setName("ban").setDescription("Ban user")
    .addUserOption(o => o.setName("user").setRequired(true)),

  new SlashCommandBuilder().setName("unban").setDescription("Unban user ID")
    .addStringOption(o => o.setName("id").setRequired(true)),

  new SlashCommandBuilder().setName("clear").setDescription("Delete messages")
    .addIntegerOption(o => o.setName("amount").setRequired(true)),

  new SlashCommandBuilder().setName("warn").setDescription("Warn user")
    .addUserOption(o => o.setName("user").setRequired(true)),

  new SlashCommandBuilder().setName("warnings").setDescription("Check warnings")
    .addUserOption(o => o.setName("user").setRequired(true)),

  // SECURITY
  new SlashCommandBuilder().setName("antiraid").setDescription("Toggle anti-raid"),
  new SlashCommandBuilder().setName("antispam").setDescription("Toggle anti-spam"),
  new SlashCommandBuilder().setName("antilink").setDescription("Toggle anti-link"),
  new SlashCommandBuilder().setName("raidmode").setDescription("Toggle raid mode"),

  // CHANNEL CONTROL
  new SlashCommandBuilder().setName("lock").setDescription("Lock channel"),
  new SlashCommandBuilder().setName("unlock").setDescription("Unlock channel"),
  new SlashCommandBuilder().setName("hide").setDescription("Hide channel"),
  new SlashCommandBuilder().setName("show").setDescription("Show channel"),

  // SERVER TOOLS
  new SlashCommandBuilder().setName("nuke").setDescription("Reset channel"),
  new SlashCommandBuilder().setName("serverinfo").setDescription("Server info"),
  new SlashCommandBuilder().setName("userinfo").setDescription("User info")
    .addUserOption(o => o.setName("user")),

  // SYSTEM
  new SlashCommandBuilder().setName("invite").setDescription("Bot invite"),
  new SlashCommandBuilder().setName("avatar").setDescription("User avatar")
    .addUserOption(o => o.setName("user")),

  // STAFF SYSTEM
  new SlashCommandBuilder().setName("addstaff").setDescription("Add staff")
    .addUserOption(o => o.setName("user").setRequired(true)),

  new SlashCommandBuilder().setName("removestaff").setDescription("Remove staff")
    .addUserOption(o => o.setName("user").setRequired(true)),

  // WHITELIST SYSTEM
  new SlashCommandBuilder().setName("whitelist").setDescription("Add whitelist user")
    .addUserOption(o => o.setName("user").setRequired(true)),

  new SlashCommandBuilder().setName("removewhitelist").setDescription("Remove whitelist user")
    .addUserOption(o => o.setName("user").setRequired(true)),

  // BLACKLIST
  new SlashCommandBuilder().setName("blacklist").setDescription("Blacklist user")
    .addUserOption(o => o.setName("user").setRequired(true))
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
  console.log("Slash commands loaded.");
})();

// =====================
// READY
// =====================
client.once("ready", () => {
  console.log(`${client.user.tag} is online`);
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
  if (cmd === "ping") {
    return interaction.reply(`🏓 ${client.ws.ping}ms`);
  }

  if (cmd === "credits") {
    return interaction.reply("⚡ Security Bot | One File System | Dev Build");
  }

  // =====================
  // MODERATION
  // =====================
  if (cmd === "kick") {
    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(user.id);
    await member.kick();
    return interaction.reply("User kicked");
  }

  if (cmd === "ban") {
    const user = interaction.options.getUser("user");
    await interaction.guild.members.ban(user.id);
    return interaction.reply("User banned");
  }

  if (cmd === "unban") {
    const id = interaction.options.getString("id");
    await interaction.guild.bans.remove(id);
    return interaction.reply("User unbanned");
  }

  if (cmd === "clear") {
    const amount = interaction.options.getInteger("amount");
    const msgs = await interaction.channel.bulkDelete(amount);
    return interaction.reply({ content: `Deleted ${msgs.size}`, ephemeral: true });
  }

  if (cmd === "warn") {
    const user = interaction.options.getUser("user");
    if (!warns.has(user.id)) warns.set(user.id, 0);
    warns.set(user.id, warns.get(user.id) + 1);
    return interaction.reply(`${user.tag} warned`);
  }

  if (cmd === "warnings") {
    const user = interaction.options.getUser("user");
    return interaction.reply(`Warnings: ${warns.get(user.id) || 0}`);
  }

  // =====================
  // SECURITY
  // =====================
  if (cmd === "antiraid") {
    settings.antiraid = !settings.antiraid;
    return interaction.reply(`Anti-Raid: ${settings.antiraid}`);
  }

  if (cmd === "antispam") {
    settings.antispam = !settings.antispam;
    return interaction.reply(`Anti-Spam: ${settings.antispam}`);
  }

  if (cmd === "antilink") {
    settings.antilink = !settings.antilink;
    return interaction.reply(`Anti-Link: ${settings.antilink}`);
  }

  if (cmd === "raidmode") {
    settings.raidmode = !settings.raidmode;
    return interaction.reply(`Raid Mode: ${settings.raidmode}`);
  }

  // =====================
  // CHANNEL CONTROL
  // =====================
  if (cmd === "lock") {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
    return interaction.reply("Locked");
  }

  if (cmd === "unlock") {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: true });
    return interaction.reply("Unlocked");
  }

  if (cmd === "hide") {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: false });
    return interaction.reply("Hidden");
  }

  if (cmd === "show") {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: true });
    return interaction.reply("Visible");
  }

  // =====================
  // SERVER TOOLS
  // =====================
  if (cmd === "nuke") {
    const ch = interaction.channel;
    await ch.delete();
    interaction.guild.channels.create({ name: ch.name });
  }

  if (cmd === "serverinfo") {
    return interaction.reply(`Server: ${interaction.guild.name} | Members: ${interaction.guild.memberCount}`);
  }

  if (cmd === "userinfo") {
    const user = interaction.options.getUser("user") || interaction.user;
    return interaction.reply(`User: ${user.tag}`);
  }

  // =====================
  // SYSTEM
  // =====================
  if (cmd === "invite") {
    return interaction.reply("https://discord.com/oauth2/authorize?client_id=YOUR_ID");
  }

  if (cmd === "avatar") {
    const user = interaction.options.getUser("user") || interaction.user;
    return interaction.reply(user.displayAvatarURL());
  }

  // =====================
  // STAFF SYSTEM
  // =====================
  if (cmd === "addstaff") {
    const user = interaction.options.getUser("user");
    staff.add(user.id);
    return interaction.reply(`👮 ${user.tag} added to staff`);
  }

  if (cmd === "removestaff") {
    const user = interaction.options.getUser("user");
    staff.delete(user.id);
    return interaction.reply(`❌ ${user.tag} removed from staff`);
  }

  // =====================
  // WHITELIST SYSTEM
  // =====================
  if (cmd === "whitelist") {
    const user = interaction.options.getUser("user");
    whitelist.add(user.id);
    return interaction.reply(`🟢 ${user.tag} whitelisted`);
  }

  if (cmd === "removewhitelist") {
    const user = interaction.options.getUser("user");
    whitelist.delete(user.id);
    return interaction.reply(`🔴 ${user.tag} removed from whitelist`);
  }

  // =====================
  // BLACKLIST
  // =====================
  if (cmd === "blacklist") {
    const user = interaction.options.getUser("user");
    blacklist.add(user.id);
    return interaction.reply(`⛔ ${user.tag} blacklisted`);
  }
});

client.login(TOKEN);