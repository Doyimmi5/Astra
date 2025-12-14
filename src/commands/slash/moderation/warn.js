const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ModerationService = require('../../../services/Moderation');
const Locales = require('../../../services/Locales');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issue a warning to a user')
    .addUserOption(option => 
      option.setName('target').setDescription('The user to warn').setRequired(true))
    .addStringOption(option => 
      option.setName('reason').setDescription('Reason for the warning').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction, client, config) {
    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const lang = config.language;

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: '❌ You cannot warn yourself.', ephemeral: true });
    }
    if (target.bot) {
      return interaction.reply({ content: '❌ You cannot warn bots.', ephemeral: true });
    }
    
    await interaction.deferReply();

    try {
      let dmSent = false;
      try {
        await target.send({
          embeds: [
            new EmbedBuilder()
              .setTitle(`⚠️ Warned in ${interaction.guild.name}`)
              .setDescription(`**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)
              .setColor(0xFFAA00)
              .setTimestamp()
          ]
        });
        dmSent = true;
      } catch (e) {
        dmSent = false;
      }

      const caseData = await ModerationService.createCase(
        interaction.guildId,
        target.id,
        interaction.user.id,
        'WARN',
        reason
      );

      const embed = new EmbedBuilder()
        .setTitle(`Case #${caseData.caseId} | Warn Issued`)
        .setColor(0xFFAA00)
        .addFields(
          { name: 'Target', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason }
        )
        .setFooter({ text: dmSent ? '✅ DM Sent' : '❌ DM Failed (User blocked DMs)' });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.editReply('⚠ An error occurred while saving the case.');
    }
  },
};