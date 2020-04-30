'use strict';

const Hapi = require('@hapi/hapi');
const { Client } = require('discord.js');

const client = new Client();
const commands = require('./commands');

const startApp = async () => {
  const server = Hapi.Server({
    port: process.env.PORT || 3000
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

client.once('ready', () => {
  client.user.setPresence({
    status: 'online'
  });
});

client.on('message', (message) => {
  try {
    const args = message.content.split(' ');
    const cmd = args.shift().toLowerCase();

    if (!commands[cmd]) return;
    commands[cmd].execute(message, args);
  } catch (error) {}
});

client.login(process.env.BOT_TOKEN || require('./secrets.json').token);

startApp();
