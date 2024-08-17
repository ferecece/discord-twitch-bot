const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const guilds = require('../../databases/index.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("listajuegos")
		.setDescription('Ver lista de juegos para filtrar los directos de Twitch de este servidor')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			await interaction.deferReply();

            const gameFilters = await guilds.get(`${interaction.guild.id}.games`);
			if (!gameFilters) return await interaction.editReply(`Primero ejecuta el comando /crear antes de usar los demás`);
			else if (gameFilters.length === 0) return await interaction.editReply('No hay juegos, agrega con comando /juego');
            console.log(gameFilters);
            gameFilters.map(async (g, i) => {
                const e = new EmbedBuilder()
                .setColor('#9146FF')
                .setTitle(g.name)
                .setThumbnail(g.icon);

                if (i > 0) {
                    await interaction.channel.send({ embeds : [e] });
                }
                else {
                    await interaction.editReply({ embeds : [e] });
                }
            });
		}
		catch(e) {
			console.error(e);
			await interaction.editReply('Algo falló al obtener la lista de juegos de este servidor');
		}
	}
}