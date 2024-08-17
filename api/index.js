const axios = require('axios').default;

module.exports = axios.create({
    baseURL: 'https://api.twitch.tv/helix/',
    timeout: 10000
});