/**
 * @file app.js
 * @description An example how to use MySQL in your Discord bot
 * @author HalloSouf
 * @version 1.0.0
 */

// Require all needed packages and files
const { Client, MessageEmbed } = require('discord.js');
const { createConnection } = require('mysql');
const config = require('./config.json');

const client = new Client();

// Prepare the mysql connection
let con = createConnection(config.mysql);

// Then we are going to connect to our MySQL database and we will test this on errors
con.connect(err => {
    // Console log if there is an error
    if (err) return console.log(err);

    // No error found?
    console.log(`MySQL has been connected!`);
});

// Ready event
client.on('ready', () => {
    // Log when bot is ready
    console.log(`${client.user.tag} is online!`);
});

// Message event
client.on('message', message => {

    if (message.author.bot || !message.guild) return;

    // Execute SELECT query
    // This is an example how I designed my "settings" table. My readme.md file includes a screen with an example.
    con.query(`SELECT * FROM settings WHERE setting = 'prefix'`, (err, row) => {

        let prefix = row[0].value;
        let args = message.content.slice(prefix.length).trim().split(/ +/g);
        let command = args.shift().toLowerCase();

        if (!message.content.startsWith(prefix)) return;
        if (message.guild && !message.member) await message.guild.fetch.members(message.author);

        let member = message.guild.member(message.mentions.users.first() || args[0]);

        // Commands (It doesn't matter where you want to use your MySQl connection)
        switch (command) {

            case 'ping':
                message.channel.send(`The client ping is **${client.ws.ping}ms**`);
                break;

            case 'avatar':
                let avatarEmbed = new MessageEmbed()
                    .setTitle(`**${member ? member.user.tag : message.author.tag}'s avatar:**`)
                    .setImage(`${member ? member.user.avatarURL() : message.author.displayAvatarURL()}`)
                    .setTimestamp()
                    .setFooter(`Example`)
                message.channel.send(avatarEmbed);
                break;

            case 'settings':
                // New prfix
                let newPrefix = args[0];
                if (!newPrefix) return message.channel.send(`Maybe you have forget to enter a new prefix!`);
                
                // Using the UPDATE query
                con.query(`UPDATE settings SET setting = '${newPrefix}' WHERE setting = 'prefix'`, (err, row) => {
                    // Return if there is an error
                    if (err) return console.log(err);

                    message.channel.send(new MessageEmbed()
                    .setTitle('¡Succesfully Changed!')
                    .setDescription(`The prefix has been changed succesfully.\nNow py prefix is ${newPrefix}`)
                    .setFooter(message.guild.name, message.guild.iconURL({ dynamic: true, format: "jpg", size: 2048 }))
                    .setTimestamp()
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true, format: "png", size: 2048 }))
                    .setColor("GREEN")
);                   //A nice embed so that it is better decorated :)
                });

        }

    });

});

// Login into your bot with the bot token
client.login(config.client.token);
