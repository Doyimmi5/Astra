const { PermissionsBitField } = require('discord.js');
const Locales = require('../../../services/Locales');

module.exports = {
  name: 'ping',
  aliases: ['latency'],
  description: 'Check bot latency',
  cooldown: 5, // seconds
  permissions: [PermissionsBitField.Flags.SendMessages],
  async execute(message, args, client, config) {
    const latency = Date.now() - message.createdTimestamp;
    message.reply(Locales.get(config.language, 'PONG', { latency }));
  },
};