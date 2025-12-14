const mongoose = require('mongoose');

const GuildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, default: process.env.DEFAULT_PREFIX },
  language: { type: String, default: 'en' },
  staffRoles: [{ type: String }],
});

// Cache layer: We can implement a static map or use a caching library here
// For simplicity in this example, we rely on Mongoose's internal caching or basic queries
module.exports = mongoose.model('GuildConfig', GuildConfigSchema);