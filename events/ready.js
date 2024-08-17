const { Events } = require("discord.js");
//const guilds = require('../databases/index.js');

const { notifyStreams } = require('../workers/notify.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    notifyStreams(client);
  }
};