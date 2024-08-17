const API = require('./index.js');
const { getToken } = require('./auth.js');
const { twitchClientId, twitchSecret } = require('../config.json');

module.exports.queryGame = async(query) => {
    const { access_token } = await getToken();
    const { data } = await API.get('games', {
        params: {
            name: query
        },
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Client-Id': twitchClientId
    }});
    return data.data[0];
}