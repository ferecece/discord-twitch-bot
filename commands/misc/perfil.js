const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const guilds = require('../../databases/index.js');
const isImage = require('is-image-header');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('perfil')
		.setDescription('Edita el perfil del bot')
		.addStringOption(option =>
			option.setName('nombre')
				.setDescription('Nombre que aparecerá en los avisos de directos')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('avatar')
				.setDescription('URL de imagen a usar de foto de perfil que aparecerá en los avisos de directos')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			await interaction.deferReply();
			const name = interaction.options.getString('nombre').trim();
			const avatar = interaction.options.getString('avatar');
			await guilds.set(`${interaction.guild.id}.name`, name);
			await guilds.set(`${interaction.guild.id}.avatar`, avatar);

			const result = await isImage(avatar);
			if(!result.isImage) return await interaction.editReply(`La URL ingresada para la foto de perfil es inválida, comprueba que sea una imágen JPG o PNG`);

			const embed = new EmbedBuilder()
				.setColor('#9146FF')
				.setTitle(`Desde ahora avisaré sobre directos a nombre de "${name}" usando esta foto de perfil`)
				.setImage(avatar);
			await interaction.editReply({ embeds: [embed] });
		}
		catch (e) {
			console.error(e);
			await interaction.editReply('Algo falló al actualizar el perfil para este servidor');
		}
	}
}