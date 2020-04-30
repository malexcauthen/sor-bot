'use strict';

const { MessageEmbed } = require('discord.js');
const { ror } = require('../config.json');

module.exports = {
  name: 'sorhelp',
  description: 'Gives users a list of available commands',
  execute: (message, args = null) => {
    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('State of The Realm Bot')
      .setDescription(
        `The State of The Realm Bot gives an overview of what is happening on the [Warhammer Return of Reckoning Online Private Server](${ror}). If you are having trouble, please message @Zakgrin.`
      )
      .addFields([
        {
          name: '!health',
          value: 'Lets you know if the bot is running'
        },
        {
          name: '!warreport',
          value: 'Lets you know what is going on in ORvR right now!'
        },
        {
          name: '!sorhelp',
          value: 'Returns a list of possible commands'
        }
      ]);

    message.channel.send(embed);
  }
};
