const { SlashCommandBuilder } = require('discord.js');
const Locales = require('../../../services/Locales');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
    
  async execute(interaction, client, config) {
    const latency = Date.now() - interaction.createdTimestamp;
    await interaction.reply(Locales.get(config.language, 'PONG', { latency }));
  },
};