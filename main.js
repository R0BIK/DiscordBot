const { Client, GatewayIntentBits, OAuth2Scopes, PermissionFlagsBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});
const id = "!";
require('dotenv').config();
const token = process.env.DISCORD_BOT_TOKEN;

client.on("ready", () => {
    console.log(`Bot launched successfully. Bot nickname: ${client.user.tag}`)

    const link = client.generateInvite({
        permissions: [
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ManageGuild,
            PermissionFlagsBits.MentionEveryone,
        ],
        scopes: [OAuth2Scopes.Bot],
    });
    console.log(`Generated bot invite link: ${link}`);
})



client.on("messageCreate", msg => {
    console.log(msg.content.startsWith(id));
    if (msg.author.bot || !msg.content.startsWith(id)) return;
    const args = msg.content.slice(id.length).split(/ +/);
    const cmd = args.shift().toLowerCase();
    console.log(cmd);
    
    if (cmd === "ping") {
        msg.reply(`pong!\n ${Date.now() - msg.createdTimestamp}ms`);
    }
})
client.login(token)