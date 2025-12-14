const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('User Info')
    .setType(ApplicationCommandType.User),
    
  async execute(interaction, client, config) {
    const targetUser = interaction.targetUser;
    const embed = new EmbedBuilder()
      .setTitle(`${targetUser.username}'s Info`)
      .setThumbnail(targetUser.displayAvatarURL())
      .addFields(
        { name: 'ID', value: targetUser.id },
        { name: 'Bot?', value: targetUser.bot ? 'Yes' : 'No' }
      )
      .setColor(0x0099FF);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};