const { Events, ChannelType } = require('discord.js');
const GuildConfig = require('../database/schemas/GuildConfig');
const Locales = require('../services/Locales');
const Logger = require('../services/Logger');
const AutoMod = require('../services/AutoMod');

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.author.bot || message.channel.type === ChannelType.DM) return;

    // 1. Load guild config (with cache)
    let config = client.configCache.get(message.guild.id);
    if (!config) {
      config = await GuildConfig.findOne({ guildId: message.guild.id });
      if (!config) {
        config = await GuildConfig.create({ guildId: message.guild.id });
      }
      client.configCache.set(message.guild.id, config);
    }

    // 2. --- AUTO MODERATION CHECK ---
    const blocked = await AutoMod.checkMessage(message, config);
    if (blocked) return; // Message blocked/deleted

    // 3. Check prefix
    const prefix = config.prefix;
    if (!message.content.startsWith(prefix)) return;

    // 4. Parse command
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const command =
      client.prefixCommands.get(cmdName) ||
      client.prefixCommands.get(client.aliases.get(cmdName));

    if (!command) return;

    // 5. Permissions check
    if (command.permissions) {
      const authorPerms = message.channel.permissionsFor(message.author);
      if (!authorPerms || !authorPerms.has(command.permissions)) {
        return message.reply(
          Locales.get(config.language, 'NO_PERMISSION')
        );
      }
    }

    // 6. Cooldown system
    if (command.cooldown) {
      const current = Date.now();
      const time = command.cooldown * 1000;

      if (!client.cooldowns.has(command.name)) {
        client.cooldowns.set(command.name, new Map());
      }

      const timestamps = client.cooldowns.get(command.name);
      if (timestamps.has(message.author.id)) {
        const expiration = timestamps.get(message.author.id) + time;
        if (current < expiration) {
          const timeLeft = (expiration - current) / 1000;
          return message.reply(
            Locales.get(config.language, 'COOLDOWN_ACTIVE', {
              time: timeLeft.toFixed(1)
            })
          );
        }
      }

      timestamps.set(message.author.id, current);
      setTimeout(() => timestamps.delete(message.author.id), time);
    }

    // 7. Execute command
    try {
      await command.execute(message, args, client, config);
    } catch (error) {
      Logger.error(`Error executing command ${command.name}`, error);
      message.reply(
        Locales.get(config.language, 'ERROR_GENERIC')
      );
    }
  }
};
