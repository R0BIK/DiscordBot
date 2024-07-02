require('dotenv').config();
const { Client, GatewayIntentBits, OAuth2Scopes, PermissionFlagsBits, User} = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

const id = "!";
const orgRoleID = "930124614712062013";
const recruitRoleID = "1053826460646916116";
const deplRoleID = "986610276331831316";
const leadRoleID = "1044333811816743002";

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
    
    if (cmd === "check") {
        if (args.length === 1) {
            return;
        } 
        if (args.length === 0) {
            const monday = 1;
            const sunday = 7;
            const endDate = new Date();
            if (endDate.getDay() !== sunday && endDate.getDay() !== monday) {
                endDate.setDate(endDate.getDate() - endDate.getDay() + 1);
                endDate.setHours(23, 59, 59);
            }
            const startDate = new Date();
            if (endDate.getDay() === sunday) {
                startDate.setDate(endDate.getDate() - 5);
                startDate.setHours(0, 0, 0);
            }
            else if (endDate.getDay() === monday) {
                startDate.setDate(endDate.getDate() - 6);
                startDate.setHours(0, 0, 0);
            }
            
            const channel = msg.channel;
            const messages = await fetchMessagesWithinDateRange(channel, startDate, endDate);
            const serverMembers = await getServerMembers(msg);
            const checking = await distributeRoles(messages, serverMembers, startDate, endDate, msg);
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
        });
        
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

async function getnewMembersStr(checkedMembers) {
    const newMemberChannel = await client.channels.fetch("1055918910823739485");
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - startDate.getDay() - 6);
    startDate.setHours(0, 0, 0);

    const messages = await fetchMessagesWithinDateRange(newMemberChannel, startDate, endDate);
    let newMembersStr = `\n> **Новички (${startDate.getDate()}.${startDate.getMonth() + 1}.${startDate.getFullYear()} - ${endDate.getDate()}.${endDate.getMonth() + 1}.${endDate.getFullYear()}):**\n`;

    messages.forEach(msg => {
        msg.mentions.members.forEach(member => {
            if (member !== msg.member && member.roles.cache.has(orgRoleID)) {
                checkedMembers.add(member);
                newMembersStr += `> ${member.displayName} вступил ${msg.createdAt.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}\n`
            }
        })
    })

    return newMembersStr;
}

async function getVacationMembersStr(checkedMembers) {
    const vacationMessage = await fetchMessagesOfVacation();
    
    let vacationMembersStr = `\n> **Отпуск:**\n`;

    vacationMessage.mentions.members.forEach(member => {
        if (member.roles.cache.has(orgRoleID)) {
            checkedMembers.add(member);
            vacationMembersStr += `> ${member.displayName}\n`
        }
    })
    
    return vacationMembersStr;
}

async function fetchMessagesOfVacation() {
    const vacationChannel = await client.channels.fetch("1008883609983275078");
    let lastID;

    for (let i = 0; i < 3; i++) {
        const options = { limit: 10 };
        if (lastID) {
            options.before = lastID;
        }

        const fetchedMessages = await vacationChannel.messages.fetch(options);

        if (fetchedMessages.size === 0) {
            break;
        }

        for (const msg of fetchedMessages.values()) {
            if (msg.content.includes("🌴 ОТПУСК 🌴")) {
                return msg;
            }
        }

        lastID = fetchedMessages.last().id;

        if (fetchedMessages.size < 10) {
            break;
        }
    }
    
    return null;
}

function isMemberWithRoleAndNotChecked(msg, checkedMembers, role) {
    return (msg.member.roles.cache.has(role) && !checkedMembers.has(msg.member));
}

function isRoleAndPaymentChecked(member, checkedMembers, role) {
    return !!(member.roles.cache.has(role) && !checkedMembers.has(member));   
    
}

function checkPayment(msg, checkedMembers, replyMsg) {
    if (msg.attachments.size === 1) {
        replyMsg += `> ${msg.member.displayName} - 💸 ❎\n`;
        checkedMembers.add(msg.member);
        // takeMoneyQuantity++;
    }
    return replyMsg;
}

async function distributeRoles(messages, serverMembers, startDate, endDate, userMessage) {
    let resultMessage = "";
    const checkedMembers = new Set();
    
    let leadMembersStr = `\n> **Leader:**\n`;
    let deplMembersStr = `\n> **Dep.Leader:**\n`;
    let recruitMembersStr = `\n> **Рекруты:**\n`;
    let orgPayMembersStr = `\n> **Закинули деньги:**\n`;
    let orgMembersStr = `\n> **Не закинули деньги:**\n`;

    messages.forEach(msg => {
        if (isMemberWithRoleAndNotChecked(msg, checkedMembers, leadRoleID)) {
            leadMembersStr = checkPayment(msg, checkedMembers, leadMembersStr);
        } else if (isMemberWithRoleAndNotChecked(msg, checkedMembers, deplRoleID)) {
            deplMembersStr = checkPayment(msg, checkedMembers, deplMembersStr);
        } else if (isMemberWithRoleAndNotChecked(msg, checkedMembers, recruitRoleID)) {
            recruitMembersStr = checkPayment(msg, checkedMembers, recruitMembersStr);
        } else if (isMemberWithRoleAndNotChecked(msg, checkedMembers, orgRoleID)) {
            orgPayMembersStr = checkPayment(msg, checkedMembers, orgPayMembersStr);
        }
    });

    const newMembersStr = await getnewMembersStr(checkedMembers);
    const vacationMembersStr = await getVacationMembersStr(checkedMembers);

    serverMembers.forEach(member => {
        if (isRoleAndPaymentChecked(member, checkedMembers, leadRoleID)) {
            leadMembersStr += `> ${member.displayName} - ❌\n`;
            checkedMembers.add(member);
        }
        else if (isRoleAndPaymentChecked(member, checkedMembers, deplRoleID)) {
            deplMembersStr += `> ${member.displayName} - ❌\n`;
            checkedMembers.add(member);
        }
        else if (isRoleAndPaymentChecked(member, checkedMembers, recruitRoleID)) {
            recruitMembersStr += `> ${member.displayName} - ❌\n`;
            checkedMembers.add(member);
        }
        else if (isRoleAndPaymentChecked(member, checkedMembers, orgRoleID)) {
            orgMembersStr += `> ${member.displayName} - ❌\n`;
            checkedMembers.add(member);
        }
    })

    resultMessage += orgPayMembersStr + orgMembersStr + newMembersStr + vacationMembersStr + recruitMembersStr + deplMembersStr + leadMembersStr;

    const sundayDate = new Date(new Date().setDate(startDate.getDate() + 5));

    const info = "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n" +
        `Проверка пополнения счета организации на **$15.000** в воскресенье **${sundayDate.getDate()}.${sundayDate.getMonth() + 1}.${sundayDate.getFullYear()}**.\n` +
        `**Промежуток проверенных дат:** ${startDate.getDate()}.${startDate.getMonth() + 1}.${startDate.getFullYear()} - ${endDate.getDate()}.${endDate.getMonth() + 1}.${endDate.getFullYear()}\n` +
        `**Пополнили счет:** \n` +
        `**Прибыль в организацию:** \n` +
        "**Прошли проверку:** 0 \n" +
        `**Просрочили оплату:** ${orgMembersStr.split(/\n/).length - 3} \n` +
        "\n" +
        `**Новичков:** ${newMembersStr.split(/\n/).length - 3}\n` +
        `**В отпуске:** ${vacationMembersStr.split(/\n/).length - 3}\n` +
        `**Рекрутов:** ${recruitMembersStr.split(/\n/).length - 3}\n` +
        `**Деп лидеров:** ${deplMembersStr.split(/\n/).length - 3}\n` +
        `**Лидеров:** ${leadMembersStr.split(/\n/).length - 3}\n` +
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
    
    // console.log(resultMessage);
    await userMessage.channel.send(resultMessage);
    await userMessage.channel.send(info);
    userMessage.delete();
}

client.login(process.env.DISCORD_BOT_TOKEN)