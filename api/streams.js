const API = require('./index.js');
const { getToken } = require('./auth.js');
const { twitchClientId, twitchSecret } = require('../config.json');


module.exports.getStreams = async(ids) => {
    const { access_token } = await getToken();
    const { data } = await API.get('streams', {
        params: {
            user_id: ids
        },
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Client-Id': twitchClientId
    }});
    return data.data;
}