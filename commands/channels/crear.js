const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const guilds = require('../../databases/index.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('crear')
		.setDescription('Creare un canal de texto que usaré para notificar cuando estén en directo')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		await interaction.deferReply();

		//if (!(interaction.member.permissions.has('ADMINISTRATOR') || interaction.user.id == ownerId)) return await interaction.editReply(`No tienes los permisos para usar este comando`);
		
		const streamsChannelId = await guilds.get(`${interaction.guild.id}.streamsChannelId`);
		//let everyoneRole = interaction.guild.roles.cache.find(r => r.name === '@everyone');
		let channel;
		
		try {
			if(!streamsChannelId) {
				await guilds.set(interaction.guild.id, {
					name: null,
					avatar: null,
					offlineImage: false,
					mentionRoleId: false,
					streamsChannelId: null,
					channels: [],
					keywords: [],
					games: [],
					useThumbnail: false,
					streamsLength: 0
				  });
				channel = await interaction.guild.channels.create({
					name: 'streams',
					reason: 'Es necesario para poder notificar cuando estén en directo',
					type: ChannelType.GuildText,
					permissionOverwrites: [
						{
							id: interaction.guild.roles.everyone.id,
							deny: [PermissionFlagsBits.SendMessages],
						},
						{
							id: interaction.client.user.id,
							allow: [PermissionFlagsBits.SendMessages],
						},
					 ]
				})
			}
			else {
				const textChannel = interaction.guild.channels.cache.find(channel => channel.id === streamsChannelId);
				if (!textChannel) {
					channel = await interaction.guild.channels.create({
						name: 'streams',
						reason: 'Es necesario para poder notificar cuando estén en directo',
						type: ChannelType.GuildText,
						permissionOverwrites: [
							{
								id: interaction.guild.roles.everyone.id,
								deny: [PermissionFlagsBits.SendMessages],
							},
							{
								id: interaction.client.user.id,
								allow: [PermissionFlagsBits.SendMessages],
							},
						 ]
					})
				}
				else {
					return await interaction.editReply('Ya existe un canal de streams');
				}
			}
			await guilds.set(`${interaction.guild.id}.streamsChannelId`, channel.id);
			await interaction.editReply('Perfecto, puedes agregar los canales de Twitch que notificaré con /agregar');
		}
		catch (e) {
			console.error(e);
			await interaction.editReply('Algo fallló al crear el canal de texto');
		}
	}
}