'use strict';

const Hapi = require('@hapi/hapi');
const { Client } = require('discord.js');
const { token } = require('./secrets.json');

const client = new Client();
const commands = require('./commands');

const startApp = async () => {
  try {
    const server = Hapi.Server({
      port: 8080
    });

    server.route({
      method: 'GET',
      path: '/ping',
      handler: (request, h) => {
        return 'Ping!';
      }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);

    client.login(require('./secrets.json').token);
  } catch (error) {
    console.log(JSON.stringify(error));
  }
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

startApp();
