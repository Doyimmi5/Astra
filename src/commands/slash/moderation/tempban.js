const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ModerationService = require('../../../services/Moderation');
const ms = require('ms'); // Requires: npm install ms

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempban')
    .setDescription('Temporarily ban a user from the server')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to ban')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('duration')
        .setDescription('Duration (e.g., 1d, 2h, 30m)')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction, client, config) {
    const targetUser = interaction.options.getUser('target');
    const durationInput = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    // 1. Parse Duration
    const durationMs = ms(durationInput);
    if (!durationMs || durationMs < 1000 || durationMs > ms('365d')) {
      return interaction.reply({ 
        content: '❌ Invalid duration. Please use formats like `1h`, `2d`, `30m`. (Max 1 year)', 
        ephemeral: true 
      });
    }

    // Calculate Expiration Date
    const expiresAt = new Date(Date.now() + durationMs);

    // 2. Fetch Member (to check hierarchy)
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    // 3. Validation Checks
    if (targetUser.id === interaction.user.id) {
      return interaction.reply({ content: '❌ You cannot ban yourself.', ephemeral: true });
    }
    
    if (targetMember) {
      // Check if Bot can ban target
      if (!targetMember.bannable) {
        return interaction.reply({ content: '❌ I cannot ban this user (they have a higher or equal role to me).', ephemeral: true });
      }
      // Check if Executor can ban target (Role Hierarchy)
      if (interaction.member.roles.highest.position <= targetMember.roles.highest.position) {
        return interaction.reply({ content: '❌ You cannot ban this user (they have a higher or equal role to you).', ephemeral: true });
      }
    }

    await interaction.deferReply();

    try {
      // 4. Notify User via DM
      let dmSent = false;
      try {
        await targetUser.send({
          embeds: [
            new EmbedBuilder()
              .setTitle(`🚫 Temporarily Banned from ${interaction.guild.name}`)
              .setColor(0xFF0000)
              .addFields(
                { name: 'Duration', value: durationInput, inline: true },
                { name: 'Reason', value: reason, inline: true },
                { name: 'Moderator', value: interaction.user.tag }
              )
              .setFooter({ text: 'You will be unbanned automatically when the time expires.' })
          ]
        });
        dmSent = true;
      } catch (err) {
        dmSent = false;
      }

      // 5. Perform the Ban
      await interaction.guild.members.ban(targetUser.id, { 
        reason: `[Tempban ${durationInput}] ${reason}` 
      });

      // 6. Save to Database (Service Layer)
      // Note: We pass 'expiresAt' as the last argument
      const caseData = await ModerationService.createCase(
        interaction.guild,
        targetUser.id,
        interaction.user.id,
        'TEMPBAN',
        reason,
        expiresAt // <--- CRITICAL: Sending the expiration date
      );

      // 7. Reply to Channel
      const embed = new EmbedBuilder()
        .setTitle(`Case #${caseData.caseId} | Tempban Issued`)
        .setColor(0xFF0000)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { name: 'Target', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: 'Duration', value: durationInput, inline: true },
          { name: 'Unban Date', value: `<t:${Math.floor(expiresAt.getTime() / 1000)}:f>`, inline: false },
          { name: 'Reason', value: reason }
        )
        .setFooter({ text: dmSent ? '✅ DM Sent' : '❌ DM Failed (User DMs closed)' });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.editReply('⚠ An error occurred while processing the ban.');
    }
  },
};