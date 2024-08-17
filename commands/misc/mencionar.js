const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const guilds = require('../../databases/index.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mencionar')
		.setDescription('Si deseas que se mencione el rol cuando se inicie un nuevo directo')
		.addRoleOption(option =>
			option.setName('rol')
				.setDescription('Rol a usar'))
		.addBooleanOption(option =>
				option.setName('eliminar')
				.setDescription('Eliminar la mención'))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			await interaction.deferReply();
			const eliminar = interaction.options.getBoolean('eliminar');
			const mentionRoleId = await guilds.get(`${interaction.guild.id}.mentionRoleId`);
			if (mentionRoleId === undefined) return await interaction.editReply(`Primero ejecuta el comando /crear antes de usar los demás`);
			
			if(eliminar) {
				await guilds.set(`${interaction.guild.id}.mentionRoleId`, false);	
				return await interaction.editReply(`A partir de ahora, no mencionaré ningún rol con la llegada de nuevos directos`);
			}
			const role = interaction.options.getRole('rol');
			await guilds.set(`${interaction.guild.id}.mentionRoleId`, role.id);
			return await interaction.editReply(`A partir de ahora, mencionaré el rol de **${role.name}** cuando hayan nuevos directos`);
		}
		catch (e) {
			console.error(e);
			await interaction.editReply('Algo falló al actualizar la mención para este servidor');
		}
	}
}