const { Events, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../database/schemas/GuildConfig');
const ModerationService = require('../services/Moderation');
const Locales = require('../services/Locales'); // Assuming you want to handle language

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {

    // Fetch guild configuration from cache or load if missing
    let config = client.configCache.get(interaction.guildId);
    if (!config && interaction.guildId) {
      // Add logic to fetch config from the database if not in cache
      config = await GuildConfig.findOne({ guildId: interaction.guildId });
      if (config) {
        client.configCache.set(interaction.guildId, config);
      }
    }

    // --- HANDLE COMMANDS ---
    if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
      // Handle Slash and Context Menu commands
      const command = interaction.isChatInputCommand() 
        ? client.slashCommands.get(interaction.commandName)
        : client.contextCommands.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(interaction, client, config);
      } catch (error) {
        console.error(error);
      }
    }

    // --- HANDLE MODALS (New Logic for Warn Modal) ---
    else if (interaction.isModalSubmit()) {
      
      // Check if this is our Warn Modal
      if (interaction.customId.startsWith('warn_modal_')) {
        await interaction.deferReply();

        try {
          // Extract user ID from the custom modal ID "warn_modal_123456789"
          const targetId = interaction.customId.split('_')[2];
          const reason = interaction.fields.getTextInputValue('reason_input');

          // Reuse ModerationService to create a new case
          const caseData = await ModerationService.createCase(
            interaction.guild, // Pass full Guild object for logging
            targetId,
            interaction.user.id,
            'WARN',
            reason
          );

          // Embed confirmation message
          const embed = new EmbedBuilder()
            .setTitle(`Case #${caseData.caseId} | Warn Issued via Modal`)
            .setColor(0xFFAA00)
            .setDescription(`**User:** <@${targetId}>\n**Reason:** ${reason}`);

          await interaction.editReply({ embeds: [embed] });

        } catch (error) {
          console.error(error);
          await interaction.editReply({ 
            content: '❌ Failed to process the warning.', 
            ephemeral: true 
          });
        }
      }
    }
  },
};
