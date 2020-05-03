'use strict';

const Request = require('request-promise');

const { sorApi } = require('./config.json');
const { apiKey } = require('./secrets.json');

const getSORData = async () => {
  return Request.post(sorApi, {
    form: { api: apiKey }
  });
};

module.exports = { getSORData };
