const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const guilds = require('../../databases/index.js');
const isImage = require('is-image-header');
const { queryGame } = require('../../api/games.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('juego')
		.setDescription('Directos filtrados por juego: omitir alertas si el juego no está en la lista. Sin lista, sin filtro')
        .addStringOption(option =>
			option.setName('juego')
				.setDescription('Nombre del juego que aparece en twitch')
				.setRequired(true))
        .addBooleanOption(option =>
                option.setName('eliminar')
                .setDescription('Eliminar juego de la lista'))
        .addStringOption(option =>
				option.setName('icono')
				.setDescription('Opcional, URL de una imagen del juego a mostrar'))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			await interaction.deferReply();
            const game = interaction.options.getString('juego').toLowerCase().trim();
			const icon = interaction.options.getString('icono');
            const deleteGame = interaction.options.getBoolean('eliminar');

            const gameFilters = await guilds.get(`${interaction.guild.id}.games`);
			if (!gameFilters) return await interaction.editReply(`Primero ejecuta el comando /crear antes de usar los demás`);

            const gameInfo = await queryGame(game);
			if (!gameInfo) return await interaction.editReply(`No existe el juego ${game} en Twitch`);

            if(deleteGame) {
                const foundGameIndex = gameFilters.findIndex(({ name })=> name === gameInfo.name);
                if (foundGameIndex > -1) {
                    const embed = new EmbedBuilder()
                    .setColor('#9146FF')
                    .setTitle(`Eliminado el juego ${gameInfo.name}`)
                    .setThumbnail(gameFilters[foundGameIndex].icon)
    
                    gameFilters.splice(foundGameIndex, 1);
                    await guilds.set(`${interaction.guild.id}.games`, gameFilters);
    
                    return await interaction.editReply({ embeds: [embed] });
                }
                else {
                    const embed = new EmbedBuilder()
                    .setColor('#9146FF')
                    .setTitle(`No encontré el juego ${gameInfo.name} en la lista`)
                    .setThumbnail(gameInfo.box_art_url.replace('{width}', '520').replace('{height}', '720'))
                    return await interaction.editReply({ embeds: [embed] });
                }
			}

            let iconUrl;
			if (icon) {
				const result = await isImage(icon);
				if(!result.isImage) return await interaction.editReply(`La URL ingresada para la imagen del juego es inválida, comprueba que sea una imágen JPG o PNG`);
				iconUrl = icon;
			}
			else {
				iconUrl = gameInfo.box_art_url.replace('{width}', '520').replace('{height}', '720');
			}

			const foundGameIndex = gameFilters.findIndex(({ name }) => name === gameInfo.name);

			if(foundGameIndex > -1) {
				gameFilters[foundGameIndex] = {
					name: gameInfo.name,
					icon: iconUrl
				}
				await guilds.set(`${interaction.guild.id}.games`, gameFilters);
				const embed = new EmbedBuilder()
				.setColor('#9146FF')
				.setTitle(`Ya está el juego ${gameInfo.name} solo actualizaré el icono`)
				.setDescription(`Si algún stream no está jugando a este u otros juegos de la lista no habrán alertas en este servidor`)
				.setThumbnail(iconUrl)
				return await interaction.editReply({ embeds: [embed] });
			}
			else {
				await guilds.push(`${interaction.guild.id}.games`, {
					name: gameInfo.name,
					icon: iconUrl
				})
				const embed = new EmbedBuilder()
				.setColor('#9146FF')
				.setTitle(`Agregado el juego ${gameInfo.name}`)
				.setDescription(`Si algún stream no está jugando a este u otros juegos de la lista no habrán alertas en este servidor`)
				.setThumbnail(iconUrl)
				return await interaction.editReply({ embeds: [embed] });
			}
		}
		catch (e) {
			console.error(e);
			await interaction.editReply('Algo falló con el filtro por palabras');
		}
	}
}