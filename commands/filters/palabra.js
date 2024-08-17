const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const guilds = require('../../databases/index.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('palabra')
		.setDescription('Filtra los directos por palabras clave; si alguna palabra coincide, se excluye la alerta')
		.addStringOption(option =>
			option.setName('palabra')
				.setDescription('Palabra que desees filtrar')
				.setRequired(true))
        .addBooleanOption(option =>
                option.setName('eliminar')
                .setDescription('Eliminar palabra de la lista'))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			await interaction.deferReply();
			const keyword = interaction.options.getString('palabra').toLowerCase().trim();
            const deleteKeyword = interaction.options.getBoolean('eliminar');

			const keywords = await guilds.get(`${interaction.guild.id}.keywords`);
			if (!keywords) return await interaction.editReply(`Primero ejecuta el comando /crear antes de usar los demás`);
			
            if(deleteKeyword) {
				await guilds.pull(`${interaction.guild.id}.keywords`, keyword);	
				return await interaction.editReply(`Se ha eliminado la palabra **${keyword}**`);
			}
			else if (keywords.includes(keyword)) return await interaction.editReply(`Ya se encuentra la palabra **${keyword}** en la lista de filtros`);

			await guilds.push(`${interaction.guild.id}.keywords`, keyword);
			await interaction.editReply(`Perfecto, si algún stream contiene la palabra **${keyword}** no lo notificaré en este servidor`);
		}
		catch (e) {
			console.error(e);
			await interaction.editReply('Algo falló con el filtro por palabras');
		}
	}
}