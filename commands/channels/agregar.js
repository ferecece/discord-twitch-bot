const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const guilds = require('../../databases/index.js');
const { EmbedBuilder } = require('discord.js');
const twitchRegex = /^(#)?[a-zA-Z0-9][\w]{2,24}$/;
const { getChannelsWithNames } = require('../../api/channels.js');

const moment = require('moment');
moment.locale('es');
moment.duration().humanize(true);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('agregar')
		.setDescription('Agrega un canal de Twitch en este servidor')
		.addStringOption(option =>
			option.setName('canal')
				.setDescription('Nombre del canal')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			await interaction.deferReply();
			const name = interaction.options.getString('canal').toLowerCase();
			if (!twitchRegex.test(name)) return await interaction.editReply(`Es inválido el canal **${name}**`);
	
	
			const [channel] = await getChannelsWithNames([name]);
			if(!channel) return await interaction.editReply(`No se encuentra el canal **${name}** en los servidores de Twitch`);

			const channels = await guilds.get(`${interaction.guild.id}.channels`);
			if (!channels) return await interaction.editReply(`Primero ejecuta el comando /crear antes de usar los demás`);


			if(channels.includes(channel.id)) return await interaction.editReply(`Ya se encuentra ese canal en la lista`);
			await guilds.push(`${interaction.guild.id}.channels`, channel.id);
			const since = moment(channel.created_at);
			const sinceHuman = moment.duration(since.diff(moment())).humanize(true);
			const embed = new EmbedBuilder()
			.setColor('#9146FF')
			.setTitle(`Agregado el canal ${channel.display_name}`)
			.setDescription(channel.description.length >= 1 ? channel.description : null)
			.setThumbnail(channel.profile_image_url)
			.addFields(
				{ name: `Creado ${sinceHuman}`, value: '\u200B' }
			)
			await interaction.editReply({ embeds : [ embed ] });
		}
		catch (e) {
			console.error(e);
			await interaction.editReply('Algo falló al agregar el canal');
		}
	}
}