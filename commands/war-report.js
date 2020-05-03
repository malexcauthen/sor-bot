'use strict';

const { MessageEmbed } = require('discord.js');

const { getSORData } = require('../utils');
const { sor } = require('../config.json');
const Forts = require('../ror/forts');

module.exports = {
  name: 'warreport',
  description:
    'Returns the State of The Realm War Report. Gives information on where the campaign has progressed to.',
  execute: async (message, args = null) => {
    try {
      const response = await getSORData();
      const data = parseResponse(response);
      const reports = createEmbedReports(data);
      return sendReports(message, reports);
    } catch (error) {
      console.log(error);
    }
  }
};

const parseResponse = (res) => {
  const r = JSON.parse(res);
  const data = JSON.parse(r[0].data);
  return data;
};

const createEmbedReports = (data) => {
  const reports = ['keeps', 'forts', 'cities', 'zonelocks'].reduce(
    (acc, cur) => {
      return acc.concat(reportMap(cur, data));
    },
    []
  );

  return [warReport()].concat(reports);
};

const reportMap = (key, data) => {
  if (key === 'keeps') {
    return keep(data[key]);
  } else if (key === 'forts') {
    return fort(data[key]);
  } else if (key === 'cities') {
    return city(data[key]);
  } else if (key === 'zonelocks') {
    return zoneLocks(data[key]);
  }

  console.log(`Unknown property: ${key}`, JSON.stringify(data[key]));
  return [];
};

const warReport = () => {
  return new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('War Report')
    .setDescription(
      `Information on the current progression of the [T4 campaign](${sor}). **NOTE: Information may not be correct!!!**`
    );
};

const zoneLocks = (pairings = []) => {
  return pairings.map((pairing) => {
    return new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`${pairing.name}`)
      .setDescription(
        `${pairing.name} has been locked by **${pairing.owner}.**`
      );
  });
};

const keep = (keeps = []) => {
  return keeps.map((zone) => {
    const aao =
      zone.aaoOwner === 'Destruction' || zone.aaoOwner === 'Order'
        ? `${zone.aao}% ${zone.aaoOwner}`
        : zone.aaoOwner;

    const orderKeep = zone.keep1.owner === 'Order' ? 1 : 2;
    const destroKeep = zone.keep1.owner === 'Order' ? 2 : 1;

    const orderKeepStatus =
      zone[`keep${orderKeep}`].obj === 'Safe'
        ? zone[`keep${orderKeep}`].obj
        : `${zone[`keep${orderKeep}`].status} ${zone[`keep${orderKeep}`].obj}%`;

    const destroKeepStatus =
      zone[`keep${destroKeep}`].obj === 'Safe'
        ? zone[`keep${destroKeep}`].obj
        : `${zone[`keep${destroKeep}`].status} ${
            zone[`keep${destroKeep}`].obj
          }%`;

    let fields = [
      {
        name: 'AAO',
        value: aao
      },
      {
        name: 'Order',
        value: `rank ${zone[`keep${orderKeep}`].rank}\n${orderKeepStatus}\n${
          zone[`pop${orderKeep}`]
        }`,
        inline: true
      },
      {
        name: 'Destruction',
        value: `rank ${zone[`keep${destroKeep}`].rank}\n${destroKeepStatus}\n${
          zone[`pop${destroKeep}`]
        }`,
        inline: true
      }
    ];

    return new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`${zone.name}`)
      .addFields(fields);
  });
};

const fort = (forts = []) => {
  return forts.map((zone) => {
    const orderPop = Forts[zone.name] === 'Order' ? zone.pop2 : zone.pop1;
    const destroPop = Forts[zone.name] === 'Order' ? zone.pop1 : zone.pop2;

    const fields = [
      { name: 'Stage', value: zone.stage },
      { name: 'Health', value: zone.health },
      { name: 'Order', value: orderPop, inline: true },
      { name: 'Destruction', value: destroPop, inline: true }
    ];

    return new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`${zone.name}`)
      .setDescription(`Fort siege underway! Get there now!`)
      .addFields(fields);
  });
};

const city = (cities = []) => {
  return cities.map((city) => {
    return new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(city.name)
      .setDescription(`${city.name} is under attack! Get there now!`);
  });
};

const sendReports = (message, reports) => {
  reports.forEach((report) => {
    message.channel.send(report);
  });
};
