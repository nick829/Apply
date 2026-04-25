const { MessageEmbed } = require("discord.js");

// OWNER IDS (hardcoded fix as requested earlier)
const OWNER_ID = "1453592157607825595";

module.exports = {

    // ======================
    // HELP
    // ======================
    help: async (client, message) => {
        const embed = new MessageEmbed()
            .setColor(client.config.colorhex)
            .setTitle("Security Bot Help")
            .setDescription(`
**User:** ping, check, report, appeal, credits
**Admin:** prefix, serverlock, whitelist
**Manager:** staffadd, blacklist, unblacklist, ban, unban
            `);

        message.channel.send({ embeds: [embed] });
    },

    // ======================
    // PING
    // ======================
    ping: async (client, message) => {
        message.channel.send(`🏓 ${client.ws.ping}ms`);
    },

    // ======================
    // CREDITS
    // ======================
    credits: async (client, message) => {
        const embed = new MessageEmbed()
            .setColor(client.config.colorhex)
            .setDescription("Made by MyCatTiger");

        message.channel.send({ embeds: [embed] });
    },

    // ======================
    // PREFIX (ADMIN)
    // ======================
    prefix: async (client, message, args, con) => {
        if (!message.member.permissions.has("ADMINISTRATOR"))
            return message.reply("No permission.");

        if (!args[0]) return message.reply("Provide prefix.");

        con.query(
            "UPDATE guilds SET prefix=? WHERE guildid=?",
            [args[0], message.guild.id]
        );

        message.channel.send(`Prefix set to ${args[0]}`);
    },

    // ======================
    // STAFF ADD (OWNER ONLY)
    // ======================
    staffadd: async (client, message, args, con) => {
        if (message.author.id !== OWNER_ID)
            return message.reply("Owner only.");

        const user =
            message.mentions.users.first() ||
            await client.users.fetch(args[0]).catch(() => null);

        if (!user) return message.reply("User not found.");

        con.query(
            "SELECT * FROM staff WHERE userid=?",
            [user.id],
            (err, row) => {
                if (row.length)
                    return message.reply("Already staff.");

                con.query(
                    "INSERT INTO staff (userid, usertag, enforcerid, enforcertag) VALUES (?, ?, ?, ?)",
                    [user.id, user.tag, message.author.id, message.author.tag]
                );

                message.channel.send(`${user.tag} added to staff.`);
            }
        );
    },

    // ======================
    // BLACKLIST
    // ======================
    blacklist: async (client, message, args, con) => {
        if (message.author.id !== OWNER_ID)
            return message.reply("Owner only.");

        if (!args[0]) return message.reply("Provide user ID.");

        con.query(
            "INSERT INTO blacklistedusers (userid, reason) VALUES (?, ?)",
            [args[0], "manual blacklist"]
        );

        message.channel.send(`User ${args[0]} blacklisted.`);
    },

    // ======================
    // UNBLACKLIST
    // ======================
    unblacklist: async (client, message, args, con) => {
        if (message.author.id !== OWNER_ID)
            return message.reply("Owner only.");

        con.query(
            "DELETE FROM blacklistedusers WHERE userid=?",
            [args[0]]
        );

        message.channel.send(`User ${args[0]} unblacklisted.`);
    }
};