const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const guilds = require('../../databases/index.js');
const { EmbedBuilder } = require('discord.js');
const { getChannelsWithIds } = require('../../api/channels.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('canales')
		.setDescription('Muestra la lista de canales de este Servidor')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			await interaction.deferReply();
			
			const channels = await guilds.get(`${interaction.guild.id}.channels`);
			if (!channels) return await interaction.editReply(`Primero ejecuta el comando /crear antes de usar los demás`);
			else if (channels.length === 0) return await interaction.editReply(`No hay ningún canal en la lista de este servidor, puedes agregarlos con /agregar`);
			const channelsInfo = await getChannelsWithIds(channels);
			await interaction.editReply("```"+channelsInfo.map(c => c.login).join('\n')+"```");

			/*
			const embeds = makeEmbeds(streamersInfo);
			embeds.map(async(embed, i) => {
				if (i > 0) {
					await interaction.channel.send({embeds : embed });
				}
				else {
					
				}
			})*/
		}
		catch (e) {
			console.error(e);
			await interaction.editReply('Algo falló al obtener la lista de canales de este servidor');
		}
	}
}