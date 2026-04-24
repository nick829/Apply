const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fetch = require("node-fetch");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = "YOUR_BOT_TOKEN";
const API = "http://localhost:3000";
const CHANNEL_ID = "YOUR_CHANNEL_ID";

async function getApps() {
  const res = await fetch(`${API}/applications`);
  return await res.json();
}

async function sendApps() {
  const channel = await client.channels.fetch(CHANNEL_ID);
  const apps = await getApps();

  const pending = apps.filter(a => a.status === "pending");

  for (const app of pending) {

    const embed = new EmbedBuilder()
      .setTitle("📩 New Application")
      .setColor("Blue")
      .addFields(
        { name: "Username", value: app.username },
        { name: "Discord ID", value: app.discordId },
        { name: "Age", value: app.age },
        { name: "Reason", value: app.reason }
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`accept_${app.id}`)
        .setLabel("Accept")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`deny_${app.id}`)
        .setLabel("Deny")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({ embeds: [embed], components: [row] });
  }
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const [action, id] = interaction.customId.split("_");

  await fetch(`${API}/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      status: action === "accept" ? "accepted" : "denied"
    })
  });

  await interaction.reply({
    content: `Application ${action}ed.`,
    ephemeral: true
  });
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  setInterval(sendApps, 15000);
});

client.login(TOKEN);