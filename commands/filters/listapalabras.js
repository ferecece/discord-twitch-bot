const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const guilds = require('../../databases/index.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listapalabras')
		.setDescription('Ver lista de palabras para filtrar los directos de Twitch de este servidor')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			await interaction.deferReply();

			const keywords = await guilds.get(`${interaction.guild.id}.keywords`);
			if (!keywords) return await interaction.editReply(`Primero ejecuta el comando /crear antes de usar los demás`);
			else if (keywords.length === 0) return await interaction.editReply('No hay palabras, agrega con comando /palabra');

			await interaction.editReply("```"+keywords.join('\n')+"```");
		}
		catch (e) {
			console.error(e);
			await interaction.editReply('Algo falló al obtener la lista de palabras clave de este servidor');
		}

	}
}