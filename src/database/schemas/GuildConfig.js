const mongoose = require('mongoose');

const GuildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, default: process.env.DEFAULT_PREFIX },
  language: { type: String, default: 'en' },
  logChannelId: { type: String, default: null },
  staffRoles: [{ type: String }],
  
  // New: Auto-Mod Settings
  automod: {
    antiLink: { type: Boolean, default: false },
    antiSpam: { type: Boolean, default: false },
    ignoredRoles: [{ type: String }], // Roles that bypass AutoMod
    ignoredChannels: [{ type: String }] // Channels where AutoMod is disabled
  }
});

module.exports = mongoose.model('GuildConfig', GuildConfigSchema);