const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../../database/schemas/GuildConfig');
const Logger = require('../../../services/Logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure server settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Admins Only
    .addSubcommand(subcommand =>
      subcommand
        .setName('logs')
        .setDescription('Set the moderation log channel')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('The channel where logs will be sent')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('language')
        .setDescription('Set the bot language for this server')
        .addStringOption(option =>
          option
            .setName('lang')
            .setDescription('The language code (e.g., en, pt)')
            .setRequired(true)
            .addChoices(
              { name: 'English', value: 'en' },
              { name: 'Portuguese', value: 'pt' }
            )
        )
    ),

  async execute(interaction, client, config) {
    const subcommand = interaction.options.getSubcommand();

    try {
      if (subcommand === 'logs') {
        const channel = interaction.options.getChannel('channel');

        // 1. Update Database (MongoDB)
        // new: true returns the modified document
        // upsert: true creates the document if it doesn't exist
        const newConfig = await GuildConfig.findOneAndUpdate(
          { guildId: interaction.guildId },
          { logChannelId: channel.id },
          { new: true, upsert: true }
        );

        // 2. Update In-Memory Cache (Immediate Performance)
        client.configCache.set(interaction.guildId, newConfig);

        await interaction.reply({ 
          content: `✅ **Success!** Moderation logs will now be sent to ${channel}.`,
          ephemeral: true 
        });
        
        Logger.info(`Guild ${interaction.guildId} updated log channel to ${channel.id}`);
      }

      else if (subcommand === 'language') {
        const lang = interaction.options.getString('lang');

        const newConfig = await GuildConfig.findOneAndUpdate(
          { guildId: interaction.guildId },
          { language: lang },
          { new: true, upsert: true }
        );

        client.configCache.set(interaction.guildId, newConfig);

        await interaction.reply({ 
          content: `✅ **Success!** Language set to \`${lang}\`.`,
          ephemeral: true 
        });
      }

    } catch (error) {
      Logger.error(`Error in setup command for guild ${interaction.guildId}`, error);
      await interaction.reply({ 
        content: '❌ An error occurred while saving configuration.', 
        ephemeral: true 
      });
    }
  },
};