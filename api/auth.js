const axios = require('axios').default;
const { twitchClientId, twitchSecret } = require('../config.json');

module.exports.getToken = async() => {
    const { data } = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
            client_id: twitchClientId,
            client_secret: twitchSecret,
            grant_type: 'client_credentials'
        }
    });
    return data;
}