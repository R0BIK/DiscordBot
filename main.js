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

const orgRoleID = "930124614712062013";
const recruitRoleID = "1053826460646916116";
const deplRoleID = "986610276331831316";
const leadRoleID = "1044333811816743002";
const vzpRoleID = "1108021062614139010";

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
    
    if (cmd === "ping") {
        msg.reply(`pong!\n${Date.now() - msg.createdTimestamp}ms`);
    }
    
    else if (cmd === "check") {
        if (args.length === 1) {
            return;
        } 
        if (args.length === 0) {
            const channel = msg.channel;
            const now = new Date();
            const endDate = now.getDay() === 7 ? new Date() : new Date(now.setDate(now.getDate() - now.getDay()));
            endDate.setHours(23, 59, 59);
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 5);
            startDate.setHours(0, 0, 0);
            const messages = await fetchMessagesWithinDateRange(channel, startDate, endDate);
            const serverMembers = await getServerMembers(msg);
            const checking = await checkMoney(messages, serverMembers, endDate);
            // console.log(messages);
            // console.log(checking);
            await msg.reply(checking);
            msg.delete();
            // console.log(endDate);
            // console.log(startDate);
            // (await messages).forEach(message => {
            //     console.log(message.content);
            // })
        }
    }
})

async function fetchMessagesWithinDateRange(channel, startDate, endDate) {
    let messages = new Set();
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
                messages.add(msg);
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
        return await guild.members.fetch();

    } catch (error) {
        console.error('Error getting server members:', error);
        msg.reply('Произошла ошибка при получении участников сервера.');
    }
}

async function checkMoney(messages, serverMembers, endDate) {
    let resultMessage = "";
    let leadMsg = `\n> **Leader:**\n`;
    let deplMsg = `\n> **Dep.Leader:**\n`;
    let recruitMsg = `\n> **Рекруты:**\n`;
    let vzpMsg = `\n> **ВЗП стак:**\n`;
    let orgTrueMsg = `\n> **Закинули деньги:**\n`;
    let orgFalseMsg = `\n> **Не закинули деньги:**\n`;
    const checkedMembers = new Set();

    let takeMoneyQuantity = 0;

    messages.forEach(msg => {
        if (msg.member.roles.cache.has(leadRoleID) && !checkedMembers.has(msg.member)) {
            if (msg.attachments.size === 1) {
                // leadMsg += `${msg.member} - 💸 ❎\n`;
                leadMsg += `> ${msg.member.displayName} - 💸 ❎\n`;
                checkedMembers.add(msg.member);
                takeMoneyQuantity++;
            }
        }
        else if (msg.member.roles.cache.has(deplRoleID) && !checkedMembers.has(msg.member)) {
            if (msg.attachments.size === 1) {
                // deplMsg += `${msg.member} - 💸 ❎\n`;
                deplMsg += `> ${msg.member.displayName} - 💸 ❎\n`;
                checkedMembers.add(msg.member);
                takeMoneyQuantity++;
            }
        }
        else if (msg.member.roles.cache.has(recruitRoleID) && !checkedMembers.has(msg.member)) {
            if (msg.attachments.size === 1) {
                // recruitMsg += `${msg.member} - 💸 ❎\n`;
                recruitMsg += `> ${msg.member.displayName} - 💸 ❎\n`;
                checkedMembers.add(msg.member);
                takeMoneyQuantity++;
            }
        }
        else if (msg.member.roles.cache.has(vzpRoleID) && !checkedMembers.has(msg.member)) {
            if (msg.attachments.size === 1) {
                // vzpMsg += `${msg.member} - 💸 ❎\n`;
                vzpMsg += `> ${msg.member.displayName} - 💸 ❎\n`;
                checkedMembers.add(msg.member);
                takeMoneyQuantity++;
            }
        }
        else if (msg.member.roles.cache.has(orgRoleID) && !checkedMembers.has(msg.member)) {
            if (msg.attachments.size === 1) {
                // orgTrueMsg += `${msg.member} - 💸 ❎\n`;
                orgTrueMsg += `> ${msg.member.displayName} - 💸 ❎\n`;
                checkedMembers.add(msg.member);
                takeMoneyQuantity++;
            }
        }
    })

    serverMembers.forEach(member => {
        if (member.roles.cache.has(leadRoleID) && !checkedMembers.has(member)) {
            // leadMsg += `${member} - ❌\n`;
            leadMsg += `> ${member.displayName} - ❌\n`;
            checkedMembers.add(member);
        }
        else if (member.roles.cache.has(deplRoleID) && !checkedMembers.has(member)) {
            // deplMsg += `${member} - ❌\n`;
            deplMsg += `> ${member.displayName} - ❌\n`;
            checkedMembers.add(member);
        }
        else if (member.roles.cache.has(recruitRoleID) && !checkedMembers.has(member)) {
            // recruitMsg += `${member} - ❌\n`;
            recruitMsg += `> ${member.displayName} - ❌\n`;
            checkedMembers.add(member);
        }
        else if (member.roles.cache.has(vzpRoleID) && member.roles.cache.has(orgRoleID) && !checkedMembers.has(member)) {
            // vzpMsg += `${member} - ❌\n`;
            vzpMsg += `> ${member.displayName} - ❌\n`;
            checkedMembers.add(member);
        }
        else if (member.roles.cache.has(orgRoleID) && !checkedMembers.has(member)) {
            // orgFalseMsg += `${member} - ❌\n`;
            orgFalseMsg += `> ${member.displayName} - ❌\n`;
            checkedMembers.add(member);
        }
    })

    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 5);

    const info = "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n" +
        `Проверка пополнения счета организации на **$15.000** в воскресенье **${endDate.getDate()}.${endDate.getMonth() + 1}.${endDate.getFullYear()}**.\n` +
        `**Промежуток проверенных дат:** ${startDate.getDate()}.${startDate.getMonth() + 1}.${startDate.getFullYear()} - ${endDate.getDate()}.${endDate.getMonth() + 1}.${endDate.getFullYear()}\n` +
        `**Пополнили счет:** ${takeMoneyQuantity}\n` +
        "**Прошли проверку:** 0 \n" +
        `**Просрочили оплату:** ${orgFalseMsg.split(/\n/).length - 3} \n` +
        "\n" +
        "**Новичков:**  \n" +
        "**В отпуске:** \n" +
        `**Рекрутов:** ${recruitMsg.split(/\n/).length - 3}\n` +
        `**ВЗП стак:** ${vzpMsg.split(/\n/).length - 3}\n` +
        `**Деп лидеров:** ${deplMsg.split(/\n/).length - 3}\n` +
        `**Лидеров:** ${leadMsg.split(/\n/).length - 3}\n` +
        "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n" +
        "**Пояснение:**\n" +
        "💸 - **Пополнил счет**\n" +
        "✅ - **Пополнил счет и прошел проверку**\n" +
        "❎ - **Пополнил счет и не прошел проверку**\n" +
        "❌ - **Просрочил оплату**\n" +
        "\n" +
        "**Причины по который вы могли не пройти проверку:**\n" +
        "**1)** Имя в игре не совпадает с именем в Discord\n" +
        "**2)** Пополнили счет на другую сумму\n" +
        "**3)** Попал курсор в скриншот\n" +
        "**4)** Дата пополнения не входит в рамки или не правильно считана\n" +
        "**5)** Не правильный формат изображения\n" +
        "**6)** Программа не верно считала текст на фото"

    resultMessage += orgTrueMsg + orgFalseMsg + recruitMsg + vzpMsg + deplMsg + leadMsg + info;

    return resultMessage;
}

client.login(token)