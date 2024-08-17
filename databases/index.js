const { QuickDB } = require('quick.db');
const guilds = new QuickDB({ filePath: './databases/guilds.sqlite' });

module.exports = guilds;