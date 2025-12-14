const { PermissionFlagsBits } = require('discord.js');
const ModerationService = require('./Moderation');
const Logger = require('./Logger');

// Map for Anti-Spam: <GuildID_UserID, Timestamp[]>
const spamMap = new Map();

class AutoModService {
  
  /**
   * Main entry point to check a message
   * Returns TRUE if the message was blocked (deleted), FALSE if safe.
   */
  async checkMessage(message, config) {
    if (!config || !config.automod) return false;
    const { antiLink, antiSpam, ignoredRoles, ignoredChannels } = config.automod;

    // 0. Exemptions (Admins, Bots, Whitelisted Roles/Channels)
    if (message.author.bot) return false;
    if (message.member.permissions.has(PermissionFlagsBits.Administrator)) return false;
    if (ignoredChannels.includes(message.channel.id)) return false;
    if (message.member.roles.cache.some(r => ignoredRoles.includes(r.id))) return false;

    // 1. Anti-Link Module
    if (antiLink) {
      const isBlocked = await this.checkLinks(message);
      if (isBlocked) return true;
    }

    // 2. Anti-Spam Module
    if (antiSpam) {
      const isBlocked = await this.checkSpam(message);
      if (isBlocked) return true;
    }

    return false;
  }

  // --- MODULE: LINK FILTER ---
  async checkLinks(message) {
    // Regex to catch discord.gg, discord.com/invite, etc.
    const inviteRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/gi;
    
    if (inviteRegex.test(message.content)) {
      try {
        await message.delete();
        
        // Log the violation
        await ModerationService.createCase(
          message.guild,
          message.author.id,
          message.client.user.id, // The bot is the moderator
          'WARN',
          '[AutoMod] Posted an invite link'
        );
        
        const msg = await message.channel.send(`⚠️ ${message.author}, invite links are not allowed!`);
        setTimeout(() => msg.delete().catch(() => {}), 5000); // Clean up warning
        
        return true; // Stop processing
      } catch (err) {
        Logger.error('Failed to delete invite link', err);
      }
    }
    return false;
  }

  // --- MODULE: SPAM FILTER ---
  async checkSpam(message) {
    const LIMIT = 5;  // Max messages
    const TIME = 5000; // Time window (5 seconds)
    
    const key = `${message.guild.id}_${message.author.id}`;
    
    if (!spamMap.has(key)) {
      spamMap.set(key, []);
    }

    const timestamps = spamMap.get(key);
    const now = Date.now();

    // Add current message
    timestamps.push(now);

    // Filter out old messages
    while (timestamps.length > 0 && timestamps[0] < now - TIME) {
      timestamps.shift();
    }

    // Check Trigger
    if (timestamps.length >= LIMIT) {
      try {
        // Clear history so we don't mute them 10 times instantly
        spamMap.delete(key);

        // Delete the spamming messages (Bulk Delete)
        // In a real app, you might fetch recent messages to delete them
        await message.delete().catch(() => {});

        // Action: Mute (Timeout) for 1 hour
        await message.member.timeout(60 * 60 * 1000, '[AutoMod] Spam detection');

        // Log Case
        await ModerationService.createCase(
          message.guild,
          message.author.id,
          message.client.user.id,
          'MUTE',
          '[AutoMod] Spamming messages (Rate Limit Exceeded)'
        );

        const msg = await message.channel.send(`🚫 ${message.author} has been muted for spamming.`);
        setTimeout(() => msg.delete().catch(() => {}), 5000);

        return true;
      } catch (err) {
        Logger.error('Failed to handle spam', err);
      }
    }
    
    return false;
  }
}

module.exports = new AutoModService();