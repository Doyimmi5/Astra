const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
      index: true
    },

    caseId: {
      type: Number,
      required: true
    },

    targetId: {
      type: String,
      required: true,
      index: true
    },

    moderatorId: {
      type: String,
      required: true
    },

    action: {
      type: String,
      required: true,
      enum: [
        'WARN',
        'KICK',
        'BAN',
        'UNBAN',
        'MUTE',
        'UNMUTE',
        'TEMPBAN',
        'TEMPMUTE'
      ]
    },

    reason: {
      type: String,
      default: 'No reason provided'
    },

    timestamp: {
      type: Date,
      default: Date.now
    },

    expiresAt: {
      type: Date,
      default: null,
      index: true
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  {
    versionKey: false
  }
);

// Compound index for fast user history lookups
CaseSchema.index({ guildId: 1, targetId: 1 });

// Optional: ensure caseId uniqueness per guild
CaseSchema.index({ guildId: 1, caseId: 1 }, { unique: true });

module.exports = mongoose.model('Case', CaseSchema);
