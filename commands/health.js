'use strict';

module.exports = {
  name: 'health',
  description: 'Lets users know if Bot is running',
  execute: (message, args = null) => {
    message.channel.send('Bot is up and running!');
  }
};
