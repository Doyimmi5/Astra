const mongoose = require('mongoose');

const GuildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, default: process.env.DEFAULT_PREFIX },
  language: { type: String, default: 'en' },
  // New Field
  logChannelId: { type: String, default: null }, 
  staffRoles: [{ type: String }],
});

module.exports = mongoose.model('GuildConfig', GuildConfigSchema);