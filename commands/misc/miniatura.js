const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const guilds = require('../../databases');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('miniatura')
		.setDescription('Si quieres que cada aviso de stream tenga una miniatura')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			await interaction.deferReply();
			let useThumbnail = await guilds.get(`${interaction.guild.id}.useThumbnail`);
			useThumbnail = !useThumbnail;

			await guilds.set(`${interaction.guild.id}.useThumbnail`, useThumbnail);	
			return await interaction.editReply(`Desde ahora${useThumbnail ? ' ' : ' no '}usaré miniaturas en este servidor`);
		}
		catch (e) {
			console.error(e);
			await interaction.editReply('Algo falló al actualizar la configuración de miniatura de este servidor');
		}
	}
}