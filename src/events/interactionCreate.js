const { Events } = require('discord.js');
const GuildConfig = require('../database/schemas/GuildConfig');
const Locales = require('../services/Locales');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    // 1. Fetch Config
    let config = client.configCache.get(interaction.guildId);
    if (!config && interaction.guildId) {
       config = await GuildConfig.findOne({ guildId: interaction.guildId }) || 
                await GuildConfig.create({ guildId: interaction.guildId });
       client.configCache.set(interaction.guildId, config);
    }
    const lang = config ? config.language : 'en';

    // 2. Identify Command Type
    let command;
    if (interaction.isChatInputCommand()) {
      command = client.slashCommands.get(interaction.commandName);
    } else if (interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()) {
      command = client.contextCommands.get(interaction.commandName);
    }

    if (!command) return;

    // 3. Execute
    try {
      await command.execute(interaction, client, config);
    } catch (error) {
      console.error(error);
      const msg = Locales.get(lang, 'ERROR_GENERIC');
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: msg, ephemeral: true });
      } else {
        await interaction.reply({ content: msg, ephemeral: true });
      }
    }
  },
};