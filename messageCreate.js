const commands = require("./commands");

module.exports = async (client, message) => {
    if (!message.guild || message.author.bot) return;

    const prefix = client.config.prefix;

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command = commands[cmd];
    if (!command) return;

    try {
        await command(client, message, args, client.con);
    } catch (e) {
        console.error(e);
    }
};