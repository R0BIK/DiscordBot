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
    if (msg.author.bot || !msg.content.startsWith(id)) return;
    const args = msg.content.slice(id.length).split(/ +/);
    const cmd = args.shift().toLowerCase();
    
    const orgRoleID = "930124614712062013";
    const recruitRoleID = "1053826460646916116";
    const deplRoleID = "986610276331831316";
    const leadRoleID = "1044333811816743002";
    const vzpRoleID = "1108021062614139010";
    
    const botID = "927618848876814476";
    
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
            startDate.setDate(endDate.getDate() - 5);
            const messages = await fetchMessagesWithinDateRange(channel, startDate, endDate);
            const serverMembers = await getServerMembers(msg);
            const orgMembers = await getRoleMembers(msg, serverMembers, orgRoleID);
            const recruitMembers = await getRoleMembers(msg, serverMembers, recruitRoleID);
            const deplMembers = await getRoleMembers(msg, serverMembers, deplRoleID);
            const leadMembers = await getRoleMembers(msg, serverMembers, leadRoleID);
            const vzpMembers = await getRoleMembers(msg, serverMembers, vzpRoleID);
            msg.reply(members);
            // console.log(members)
            // console.log(endDate);
            // console.log(startDate);
            // (await messages).forEach(message => {
            //     console.log(message.content);
            // })
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

async function getServerMembers(msg) {
    try {
        const guild = msg.guild;
        const role = guild.roles.cache.get(roleID);

        if (!role) {
            msg.reply("Роль не найдена");
            return;
        }

        return await guild.members.fetch();

    } catch (error) {
        console.error('Error getting server members:', error);
        msg.reply('Произошла ошибка при получении участников сервера.');
    }
}

async function getRoleMembers(msg, members, roleID) {

    try {
        return members.filter(member => member.roles.cache.has(roleID))

        // const membersTags = membersWithRole.map(member => member.toString())
        // const replyWithMembers = membersTags.join('\n');
        // const membersDisplayNames = membersWithRole.map(member => member.displayName);
        // console.log(membersDisplayNames.join('\n'))
        // return replyWithMembers;

    } catch (error) {
        console.error('Error getting members with role:', error);
        msg.reply('Произошла ошибка при получении участников с ролью.');
    }
} 

client.login(token)