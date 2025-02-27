// index.js

require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
    new SlashCommandBuilder().setName('ban').setDescription('Ban a user from the server').addUserOption(option =>
        option.setName('user').setDescription('The user to ban').setRequired(true)),
    new SlashCommandBuilder().setName('kick').setDescription('Kick a user from the server').addUserOption(option =>
        option.setName('user').setDescription('The user to kick').setRequired(true)),
    new SlashCommandBuilder().setName('clear').setDescription('Clear a number of messages').addIntegerOption(option =>
        option.setName('amount').setDescription('Number of messages to delete').setRequired(true)),
    new SlashCommandBuilder().setName('userinfo').setDescription('Get information about a user').addUserOption(option =>
        option.setName('user').setDescription('The user to get info about').setRequired(true)),
    new SlashCommandBuilder().setName('serverinfo').setDescription('Get information about the server'),
    new SlashCommandBuilder().setName('quote').setDescription('Save a quote').addStringOption(option =>
        option.setName('text').setDescription('The quote text').setRequired(true)),
    new SlashCommandBuilder().setName('avatar').setDescription('Get the avatar of a user').addUserOption(option =>
        option.setName('user').setDescription('The user to get avatar of').setRequired(true)),
    new SlashCommandBuilder().setName('weather').setDescription('Get weather information for a city').addStringOption(option =>
        option.setName('city').setDescription('City to check the weather for').setRequired(true)),
    new SlashCommandBuilder().setName('poll').setDescription('Create a poll').addStringOption(option =>
        option.setName('question').setDescription('Poll question').setRequired(true)),
    new SlashCommandBuilder().setName('remindme').setDescription('Set a reminder').addStringOption(option =>
        option.setName('time').setDescription('Time for the reminder').setRequired(true)).addStringOption(option =>
        option.setName('message').setDescription('Message to remind you about').setRequired(true)),
    new SlashCommandBuilder().setName('coinflip').setDescription('Flip a coin'),
    new SlashCommandBuilder().setName('countdown').setDescription('Start a countdown').addStringOption(option =>
        option.setName('time').setDescription('Time for countdown (e.g., 5m, 10s)').setRequired(true)),
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

// Register commands
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), // Use guild for testing
            { body: commands.map(command => command.toJSON()) },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply('Pong!');
    } else if (commandName === 'ban') {
        const user = interaction.options.getUser('user');
        if (interaction.member.permissions.has('BAN_MEMBERS')) {
            await interaction.guild.members.ban(user);
            await interaction.reply(`${user.tag} has been banned.`);
        } else {
            await interaction.reply('You do not have permission to ban members!');
        }
    } else if (commandName === 'kick') {
        const user = interaction.options.getUser('user');
        if (interaction.member.permissions.has('KICK_MEMBERS')) {
            await interaction.guild.members.kick(user);
            await interaction.reply(`${user.tag} has been kicked.`);
        } else {
            await interaction.reply('You do not have permission to kick members!');
        }
    } else if (commandName === 'clear') {
        const amount = interaction.options.getInteger('amount');
        if (amount > 0 && amount <= 100) {
            await interaction.channel.bulkDelete(amount, true);
            await interaction.reply(`${amount} messages have been deleted.`);
        } else {
            await interaction.reply('Please provide a number between 1 and 100.');
        }
    } else if (commandName === 'userinfo') {
        const user = interaction.options.getUser('user');
        await interaction.reply(`User Info: \nUsername: ${user.tag} \nID: ${user.id}`);
    } else if (commandName === 'serverinfo') {
        await interaction.reply(`Server Name: ${interaction.guild.name}\nTotal Members: ${interaction.guild.memberCount}`);
    } else if (commandName === 'quote') {
        const text = interaction.options.getString('text');
        await interaction.reply(`Quote saved: "${text}"`);
    } else if (commandName === 'avatar') {
        const user = interaction.options.getUser('user');
        await interaction.reply(`${user.tag}'s Avatar: ${user.displayAvatarURL()}`);
    } else if (commandName === 'weather') {
        const city = interaction.options.getString('city');
        await interaction.reply(`Fetching weather for ${city}... (integrate API here)`);
    } else if (commandName === 'poll') {
        const question = interaction.options.getString('question');
        await interaction.reply(`Poll: ${question}`);
    } else if (commandName === 'remindme') {
        const time = interaction.options.getString('time');
        const message = interaction.options.getString('message');
        await interaction.reply(`Reminder set: "${message}" in ${time}`);
    } else if (commandName === 'coinflip') {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        await interaction.reply(`Coin flip result: ${result}`);
    } else if (commandName === 'countdown') {
        const time = interaction.options.getString('time');
        await interaction.reply(`Countdown started for ${time}`);
    }
});

client.login(process.env.BOT_TOKEN);
