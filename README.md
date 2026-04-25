# Ultra Enterprise Discord Security Bot

A powerful all-in-one Discord security bot with moderation, anti-nuke protection, raid detection, and ML-style behavior clustering.

This bot includes anti-nuke systems that automatically restore deleted channels and roles, raid detection that monitors mass joins and suspicious behavior, a DEFCON-style lockdown system, and a smart risk scoring engine that classifies users as normal, suspicious, or raid candidates.

It also includes full moderation tools such as kick, ban, warn, warnings tracking, and message clearing, along with server control commands like lock, unlock, hide, show, and nuke. A full staff system is included with owner, staff, trusted roles, plus whitelist and blacklist support for advanced permission control.

The bot features a logging system that records staff actions, moderation events, raid detection alerts, and anti-nuke recovery actions to a designated log channel.

A snapshot system allows you to save and restore server states using /snapshot and /restore, capturing channels and roles for emergency recovery.

The raid detection system uses a behavior scoring engine that evaluates each user based on account age, username patterns, join speed, bot status, and past behavior. Users are classified into normal, suspicious, or raid candidate categories. Suspicious users may be kicked while raid candidates are automatically banned.

To install, run npm install discord.js, then configure your bot token, client ID, guild ID, and owner ID inside index.js. Start the bot using node index.js.

This bot is designed for high-security Discord environments and is capable of automatically reacting to raids, nukes, and abnormal server activity in real time.

Commands include kick, ban, warn, warnings, clear, antiraid, antispam, antilink, addstaff, removestaff, whitelist, removewhitelist, blacklist, lock, unlock, hide, show, snapshot, restore, and security.

The system is designed as a single-file architecture and can be extended with database persistence or a web dashboard for production use.