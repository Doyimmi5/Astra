import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';

const caseSchema = new mongoose.Schema({
    caseId: {
        type: String,
        default: () => uuidv4(),
        unique: true,
        validate: {
            validator: (v) => validator.isUUID(v),
            message: 'Invalid UUID format'
        }
    },
    guildId: {
        type: String,
        required: true,
        validate: {
            validator: (v) => /^\d{17,19}$/.test(v),
            message: 'Invalid guild ID'
        }
    },
    userId: {
        type: String,
        required: true,
        validate: {
            validator: (v) => /^\d{17,19}$/.test(v),
            message: 'Invalid user ID'
        }
    },
    moderatorId: {
        type: String,
        required: true,
        validate: {
            validator: (v) => /^\d{17,19}$/.test(v),
            message: 'Invalid moderator ID'
        }
    },
    type: {
        type: String,
        enum: ['ban', 'kick', 'mute', 'warn', 'unmute', 'unban', 'softban', 'timeout', 'lockdown', 'slowmode'],
        required: true
    },
    reason: {
        type: String,
        default: 'No reason provided',
        maxlength: 512
    },
    duration: {
        type: Number,
        default: null
    },
    active: {
        type: Boolean,
        default: true
    },
    evidence: {
        type: String,
        default: null,
        validate: {
            validator: function(v) {
                return !v || validator.isURL(v);
            },
            message: 'Evidence must be a valid URL'
        }
    },
    expiresAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

caseSchema.index({ guildId: 1, userId: 1 });
caseSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Case', caseSchema);