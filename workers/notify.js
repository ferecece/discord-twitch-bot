
const { EmbedBuilder, ActivityType } = require('discord.js');

const guilds = require('../databases/index.js');
const { getStreams } = require('../api/streams.js');


const wordFilter = (title, keywords) => {
    for (const keyword of keywords) {
        if (title.toLowerCase().includes(keyword.toLowerCase())) {
            return false;
        }
    }
    return true;
}

const gameFilter = (name, games) => games.some(g => name === g.name);

const makeStreamEmbed = (guildData, streamData) => {
    const url = `https://www.twitch.tv/${streamData.user_login}`;
    const gameFilterIndex = guildData.value.games.findIndex(g => g.name === streamData.game_name);
    const thumbnail = `${streamData.thumbnail_url.replace('{width}', '1920').replace('{height}', '1080')}`;

    return new EmbedBuilder()
    .setColor('#9146FF')
    .setAuthor({ name: `¡${streamData.user_name} está en directo!
    `})
    .setTitle(streamData.title)
    .setURL(url)
    .setDescription(`Jugando a ${streamData.game_name}\n[Ver](${url})`)
    .setImage(guildData.value.useThumbnail ? thumbnail : null)
    .setThumbnail(gameFilterIndex > -1 ? guildData.value.games[gameFilterIndex].icon : null)
    .setFooter({
        text: `Twitch`,
        iconURL: 'https://i.imgur.com/rfxWtdb.png'
      })
    .setTimestamp(new Date(streamData.started_at));
}

async function processGuild(guildData, webhook, client) {
    const streams = await getFilteredStreams(guildData);

    const previousChannels = Object.keys(guildData.value.previousStreams);

    for (const user of guildData.value.channels) {
        const streamData = streams.find(stream => stream.user_id === user);

        if (streamData) {
            const messageOptions = {
                username: guildData.value.name,
                avatarURL: guildData.value.avatar,
                content: guildData.value.mentionRoleId !== false ? (guildData.id === guildData.value.mentionRoleId ? '@everyone' : `<@&${guildData.value.mentionRoleId}>`) : null,
                embeds: [makeStreamEmbed(guildData, streamData)]
            }
            if (!guildData.value.previousStreams[user]) {
                // Si es la primera vez que el usuario está en vivo, enviar un mensaje
                const message = await webhook.send(messageOptions);
                await guilds.set(`${guildData.id}.previousStreams.${user}`, { messageId: message.id, title: streamData.title, game: streamData.game_name, useThumbnail: guildData.value.useThumbnail });
            } else if (guildData.value.previousStreams[user].title !== streamData.title || guildData.value.previousStreams[user].game !== streamData.game_name) {
                // Si el stream cambió de juego o titulo
                try {
                    await webhook.editMessage(guildData.value.previousStreams[user].messageId, messageOptions);

                    await guilds.set(`${guildData.id}.previousStreams.${user}.title`, streamData.title);
                    await guilds.set(`${guildData.id}.previousStreams.${user}.game`, streamData.game_name);
                }
                catch (e) {
                    console.error(e);
                    const message = await webhook.send(messageOptions);
                    await guilds.set(`${guildData.id}.previousStreams.${user}`, { messageId: message.id, title: streamData.title, game: streamData.game_name, useThumbnail: guildData.value.useThumbnail });
                }
            }
            else if (guildData.value.previousStreams[user].useThumbnail !== guildData.value.useThumbnail) {
                // Si cambió la opción de miniaturas
                try {
                    await webhook.editMessage(guildData.value.previousStreams[user].messageId, messageOptions);
                    await guilds.set(`${guildData.id}.previousStreams.${user}.useThumbnail`, guildData.value.useThumbnail);
                }
                catch (e) {
                    console.error(e);
                    const message = await webhook.send(messageOptions);
                    await guilds.set(`${guildData.id}.previousStreams.${user}`, { messageId: message.id, title: streamData.title, game: streamData.game_name, useThumbnail: guildData.value.useThumbnail });
                }
            }
            //console.log(`Stream sigue igual, no enviaré nada ${Date.now().toString()} (${streamData.user_name})`);
        } else if (guildData.value.previousStreams[user]) {
            // Si el usuario ya no está en directo, eliminar el mensaje
            try {
                await webhook.deleteMessage(guildData.value.previousStreams[user].messageId);
            }
            catch (e) {
                console.error(e);
            }
            finally {
                await guilds.delete(`${guildData.id}.previousStreams.${user}`);
            }
        }
    }
    for (const userId of previousChannels) {
        if (!guildData.value.channels.includes(userId)) {
            // Eliminar el mensaje correspondiente si el canal ya no está en la lista
            try {
                await webhook.deleteMessage(guildData.value.previousStreams[userId].messageId);
            }
            catch (e) {
                console.error(e);
            }
            finally {
                await guilds.delete(`${guildData.id}.previousStreams.${userId}`);
            }
        }
    }
}

async function getFilteredStreams(guildInfo) {
    let streams = await getStreams(guildInfo.value.channels);
    
    if (guildInfo.value.games.length > 0) streams = streams.filter(stream => gameFilter(stream.game_name, guildInfo.value.games));

    if (guildInfo.value.keywords.length > 0) streams = streams.filter(stream => wordFilter(stream.title, guildInfo.value.keywords));

    return streams;
}

async function notifyStreams(client) {
    try {
        let guildList = await guilds.all();
        guildList = guildList.filter(guild => guild.value.streamsChannelId !== null && guild.value.channels.length > 0 && guild.value.name !== null && guild.value.avatar !== null);
        const serverCount = guildList.length;
        const channelsCount = guildList.map(guild => guild.value.channels.length).reduce((partialSum, a) => partialSum + a, 0);
        await client.user.setActivity(`${serverCount} servidores con ${channelsCount} canales`, { type: ActivityType.Listening });

        for (const guildData of guildList) {
            const guild = client.guilds.cache.get(guildData.id);
            if (!guild) continue;
        
            const textChannel = guild.channels.cache.find(channel => channel.id === guildData.value.streamsChannelId);
            if (!textChannel) continue;

            const webhook = await getOrCreateWebhook(guildData, client);
            await processGuild(guildData, webhook, client);
        }

        setTimeout(notifyStreams, 120000, client);
    } catch (e) {
        console.error(e);
        setTimeout(notifyStreams, 120000, client);
    }
}

async function getOrCreateWebhook(guildInfo, client) {
    const guild = client.guilds.cache.get(guildInfo.id);
    const channel = guild.channels.cache.find(channel => channel.id === guildInfo.value.streamsChannelId);
    const webhooks = await channel.fetchWebhooks();
    let webhook = webhooks.find(wh => (wh.channelId === guildInfo.value.streamsChannelId && wh.token));
    if (!webhook) {
        webhook = await channel.createWebhook({
            name: 'Streams',
            avatar: 'https://i.imgur.com/rfxWtdb.png',
            reason: 'Es necesario para tener un perfil con el que publicar cuando hayan nuevos Streams'
        });
    }
    return webhook;
}

module.exports = {
    notifyStreams
}
