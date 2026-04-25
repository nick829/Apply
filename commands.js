const { MessageEmbed } = require("discord.js");

module.exports = {
    help: async (client, message, args) => {
        const embed = new MessageEmbed()
            .setColor(client.config.colorhex)
            .setTitle("Help Menu")
            .setDescription("user | admin | manager | sticky");
        return message.channel.send({ embeds: [embed] });
    },

    ping: async (client, message) => {
        return message.channel.send(`Ping: ${client.ws.ping}ms`);
    },

    credits: async (client, message) => {
        const embed = new MessageEmbed()
            .setColor(client.config.colorhex)
            .setDescription("Made by MyCatTiger");
        return message.channel.send({ embeds: [embed] });
    },

    prefix: async (client, message, args, con) => {
        if (!message.member.permissions.has("ADMINISTRATOR"))
            return message.reply("No permission.");

        if (!args[0]) return message.reply("Provide prefix.");

        await con.query(
            "UPDATE guilds SET prefix=? WHERE guildid=?",
            [args[0], message.guild.id]
        );

        return message.channel.send(`Prefix set to ${args[0]}`);
    },

    staffadd: async (client, message, args, con) => {
        if (!client.config.owners.includes(message.author.id))
            return message.reply("Owner only.");

        const user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
        if (!user) return message.reply("User not found.");

        const existing = await new Promise((res) =>
            con.query("SELECT * FROM staff WHERE userid=?", [user.id], (e, r) => res(r))
        );

        if (existing.length) return message.reply("Already staff.");

        await con.query(
            "INSERT INTO staff (userid, usertag, enforcerid, enforcertag) VALUES (?, ?, ?, ?)",
            [user.id, user.tag, message.author.id, message.author.tag]
        );

        return message.channel.send(`${user.tag} added to staff.`);
    },

    blacklist: async (client, message, args, con) => {
        if (!client.config.owners.includes(message.author.id))
            return message.reply("Owner only.");

        const userId = args[0];
        if (!userId) return message.reply("Provide user ID.");

        await con.query(
            "INSERT INTO blacklistedusers (userid, reason) VALUES (?, ?)",
            [userId, "manual blacklist"]
        );

        return message.channel.send(`User ${userId} blacklisted.`);
    },

    unblacklist: async (client, message, args, con) => {
        if (!client.config.owners.includes(message.author.id))
            return message.reply("Owner only.");

        const userId = args[0];
        if (!userId) return message.reply("Provide user ID.");

        await con.query("DELETE FROM blacklistedusers WHERE userid=?", [userId]);

        return message.channel.send(`User ${userId} unblacklisted.`);
    }
};