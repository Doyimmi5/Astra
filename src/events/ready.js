const { Events, REST, Routes } = require('discord.js');
const Logger = require('../services/Logger');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    Logger.success(`Logged in as ${client.user.tag}`);

    // Register Slash/Context Commands
    const commands = [
      ...client.slashCommands.map(cmd => cmd.data.toJSON()),
      ...client.contextCommands.map(cmd => cmd.data.toJSON())
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
      Logger.info('Refreshing application (/) commands...');
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
      Logger.success('Successfully reloaded application (/) commands.');
    } catch (error) {
      Logger.error('Error refreshing commands', error);
    }
  },
};