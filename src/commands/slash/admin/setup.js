const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits
} = require('discord.js');

const GuildConfig = require('../../../database/schemas/GuildConfig');
const Logger = require('../../../services/Logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure server settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('logs')
        .setDescription('Set the moderation log channel')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('The channel where moderation logs will be sent')
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
            .setDescription('Language code')
            .setRequired(true)
            .addChoices(
              { name: 'English', value: 'en' },
              { name: 'Portuguese', value: 'pt' }
            )
        )
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();

    try {
      if (subcommand === 'logs') {
        const channel = interaction.options.getChannel('channel');

        const newConfig = await GuildConfig.findOneAndUpdate(
          { guildId: interaction.guildId },
          { $set: { logChannelId: channel.id } },
          { new: true, upsert: true }
        ).lean();

        client.configCache.set(interaction.guildId, newConfig);

        await interaction.reply({
          content: `✅ **Success!** Moderation logs will now be sent to ${channel}.`,
          ephemeral: true
        });

        Logger.info(
          `[Setup] Guild ${interaction.guildId} updated log channel to ${channel.id}`
        );
      }

      if (subcommand === 'language') {
        const lang = interaction.options.getString('lang');

        const newConfig = await GuildConfig.findOneAndUpdate(
          { guildId: interaction.guildId },
          { $set: { language: lang } },
          { new: true, upsert: true }
        ).lean();

        client.configCache.set(interaction.guildId, newConfig);

        await interaction.reply({
          content: `✅ **Success!** Bot language has been set to \`${lang}\`.`,
          ephemeral: true
        });

        Logger.info(
          `[Setup] Guild ${interaction.guildId} updated language to ${lang}`
        );
      }
    } catch (error) {
      Logger.error(
        `[Setup] Error while executing setup command | Guild: ${interaction.guildId}`,
        error
      );

      if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while saving the settings.',
          ephemeral: true
        });
      }
    }
  }
};
