'use strict';

const { MessageEmbed } = require('discord.js');
const Request = require('request-promise');

const { sor, sorApi } = require('../config.json');
const { apiKey } = require('../secrets.json');
const Cities = require('../ror/cities');
const Forts = require('../ror/forts');
const Pairing = require('../ror/pairing-lock');

module.exports = {
  name: 'warreport',
  description:
    'Returns the State of The Realm War Report. Gives information on where the campaign has progressed to.',
  execute: (message, args = null) => {
    Request.post(sorApi, {
      form: { api: apiKey }
    })
      .then((resp) => {
        return parseResponse(resp);
      })
      .then((data) => {
        return createEmbedReports(data);
      })
      .then((reports) => {
        return sendReports(message, reports);
      })
      .catch((error) => {
        console.log(JSON.stringify(error));
      });
  }
};

const parseResponse = (res) => {
  const r = JSON.parse(res);
  const data = JSON.parse(r[0].data);
  return data;
};

const createEmbedReports = (data) => {
  let reports = [warReport()];

  if (data.length === 4) {
    reports = [...reports, city(data)];
  } else {
    for (let row of data) {
      if (Forts[row.name]) {
        reports = [...reports, fort(row)];
      } else if (Pairing.has(row.name)) {
        reports = [...reports, pairingLocked(row)];
      } else {
        reports = [...reports, keep(row)];
      }
    }
  }

  return reports;
};

const warReport = () => {
  return new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('War Report')
    .setDescription(
      `Information on the current progression of the [T4 campaign](${sor}). **NOTE: Information may not be correct!!!**`
    );
};

const pairingLocked = (data) => {
  return new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`${data.name}`)
    .setDescription(`${data.name} has been locked by **${data.owner}.**`);
};
const keep = (data) => {
  const aao =
    data.aaoOwner === 'Destruction' || data.aaoOwner === 'Order'
      ? `${data.aao}% ${data.aaoOwner}`
      : data.aaoOwner;

  const orderKeep = data.keep1.owner === 'Order' ? 1 : 2;
  const destroKeep = data.keep1.owner === 'Order' ? 2 : 1;

  const orderKeepStatus =
    data[`keep${orderKeep}`].obj === 'Safe'
      ? data[`keep${orderKeep}`].obj
      : `${data[`keep${orderKeep}`].status} ${data[`keep${orderKeep}`].obj}%`;

  const destroKeepStatus =
    data[`keep${destroKeep}`].obj === 'Safe'
      ? data[`keep${destroKeep}`].obj
      : `${data[`keep${destroKeep}`].status} ${data[`keep${destroKeep}`].obj}%`;

  let fields = [
    {
      name: 'AAO',
      value: aao
    },
    {
      name: 'Order',
      value: `rank ${data[`keep${orderKeep}`].rank}\n${orderKeepStatus}\n${
        data[`pop${orderKeep}`]
      }`,
      inline: true
    },
    {
      name: 'Destruction',
      value: `rank ${data[`keep${destroKeep}`].rank}\n${destroKeepStatus}\n${
        data[`pop${destroKeep}`]
      }`,
      inline: true
    }
  ];

  return new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`${data.name}`)
    .addFields(fields);
};

const fort = (data) => {
  let orderPop = Forts[data.name] === 'Order' ? data.pop2 : data.pop1;
  let destroPop = Forts[data.name] === 'Order' ? data.pop1 : data.pop2;

  const fields = [
    { name: 'Stage', value: data.stage },
    { name: 'Health', value: data.health },
    { name: 'Order', value: orderPop, inline: true },
    { name: 'Destruction', value: destroPop, inline: true }
  ];

  return new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`${data.name}`)
    .setDescription(`Fort siege underway! Get there now!`)
    .addFields(fields);
};

const city = (data) => {
  let index = 0;

  for (let i = 0; i < data.length; i++) {
    if (Cities.has(data[i].name)) {
      index = i;
      break;
    }
  }

  const embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(data[index].name)
    .setDescription(`${data[index].name} is under attack! Get there now!`);

  return embed;
};

const sendReports = (message, reports) => {
  reports.forEach((report) => {
    message.channel.send(report);
  });
};
