const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const guilds = require('../../databases/index.js');
const { getChannelsWithNames } = require('../../api/channels.js');
const { EmbedBuilder } = require('discord.js');
const twitchRegex = /^(#)?[a-zA-Z0-9][\w]{2,24}$/;

const moment = require('moment');
moment.locale('es');
moment.duration().humanize(true);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eliminar')
		.setDescription('Elimina un canal de Twitch en este servidor')
		.addStringOption(option =>
			option.setName('canal')
				.setDescription('Nombre del canal')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			await interaction.deferReply();
			const name = interaction.options.getString('canal').toLowerCase();
			if (!twitchRegex.test(name)) return await interaction.editReply(`Es inválido el nombre del canal **${name}**`);

			const [channel] = await getChannelsWithNames([name]);
			if(!channel) return await interaction.editReply(`No se encuentra el canal **${name}** en los servidores de Twitch`);

			const channels = await guilds.get(`${interaction.guild.id}.channels`);
			if (!channels) return await interaction.editReply(`Primero ejecuta el comando /crear antes de usar los demás`);

			if (channels.length === 0) return await interaction.editReply(`No hay ningún canal en la lista de este servidor, puedes agregarlos con /agregar`);
			else if(!channels.includes(channel.id)) return await interaction.editReply(`No se encuentra el canal **${name}** en la lista`);

			await guilds.pull(`${interaction.guild.id}.channels`, channel.id);
	
			const since = moment(channel.created_at);
			const sinceHuman = moment.duration(since.diff(moment())).humanize(true);

			const embed = new EmbedBuilder()
			.setColor('#9146FF')
			.setTitle(`Eliminado el canal ${channel.display_name}`)
			.setDescription('Si en estos momentos está en directo, tomará unos minutos para que haga efecto y desaparezca del canal de Avisos')
			.setThumbnail(channel.profile_image_url)
			.addFields(
				{ name: `Comenzó ${sinceHuman}`, value: '\u200B' }
			)
			await interaction.editReply({ embeds : [ embed ] });
		}
		catch (e) {
			console.error(e);
			await interaction.editReply('Algo falló al eliminar');
		}
	}
}