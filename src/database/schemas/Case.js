const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  caseId: { type: Number, required: true },
  targetId: { type: String, required: true, index: true },
  moderatorId: { type: String, required: true },
  action: { 
    type: String, 
    required: true, 
    enum: ['WARN', 'KICK', 'BAN', 'UNBAN', 'MUTE', 'UNMUTE'] 
  },
  reason: { type: String, default: 'No reason provided' },
  timestamp: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

CaseSchema.index({ guildId: 1, targetId: 1 });

module.exports = mongoose.model('Case', CaseSchema);