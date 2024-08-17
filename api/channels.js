const API = require('./index.js');
const { getToken } = require('./auth.js');
const { twitchClientId, twitchSecret } = require('../config.json');

module.exports.getChannelsWithNames = async(channels) => {
    const { access_token } = await getToken();
    const { data } = await API.get('users', {
        params: {
            login: channels
        },
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Client-Id': twitchClientId
        }
    });
    return data.data;
}

module.exports.getChannelsWithIds = async(ids) => {
    const { access_token } = await getToken();
    const { data } = await API.get('users', {
        params: {
            id: ids
        },
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Client-Id': twitchClientId
        }
    });
    return data.data;
}