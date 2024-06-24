const { Client, GatewayIntentBits, OAuth2Scopes, PermissionFlagsBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

const id = "!";
require('dotenv').config();
const token = process.env.DISCORD_BOT_TOKEN;

client.on("ready", () => {
    console.log(`Bot launched successfully. Bot nickname: ${client.user.tag}`)

    const link = client.generateInvite({
        permissions: [
            PermissionFlagsBits.Administrator
        ],
        scopes: [OAuth2Scopes.Bot],
    });
    console.log(`Generated bot invite link: ${link}`);
})



client.on("messageCreate",  async (msg) => {
    console.log(msg.content.startsWith(id));
    if (msg.author.bot || !msg.content.startsWith(id)) return;
    const args = msg.content.slice(id.length).split(/ +/);
    const cmd = args.shift().toLowerCase();
    console.log(cmd);
    
    if (cmd === "ping") {
        msg.reply(`pong!\n${Date.now() - msg.createdTimestamp}ms`);
    }
    
    else if (cmd === "check") {
        if (args.length === 1) {
            return;
        } 
        if (args.length === 0) {
            const channel = msg.channel;
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 8);
            const messages = fetchMessagesWithinDateRange(channel, startDate, endDate);
            console.log(endDate);
            console.log(startDate);
            (await messages).forEach(message => {
                console.log(message.content);
            })
        }
    }
})

async function fetchMessagesWithinDateRange(channel, startDate, endDate) {
    let messages = new Map();
    let lastID;
    
    for (let i = 0; i < 3; i++) {
        const options = { limit: 100 };
        if (lastID) {
            options.before = lastID;
        }
        
        const fetchedMessages = await channel.messages.fetch(options);
        
        if (fetchedMessages.size === 0) {
            break;
        }
        
        fetchedMessages.forEach(msg => {
            if (msg.createdTimestamp >= startDate.getTime() && msg.createdTimestamp <= endDate.getTime()) {
                messages.set(msg.id, msg);
            }
        })
        
        lastID = fetchedMessages.last().id;

        if (fetchedMessages.size < 100) {
            break;
        }
    }
    
    return messages;
}

client.login(token)