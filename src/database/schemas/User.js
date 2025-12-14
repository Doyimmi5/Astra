import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (v) => /^\d{17,19}$/.test(v),
            message: 'Invalid user ID'
        }
    },
    warnings: [{
        guildId: {
            type: String,
            required: true,
            validate: {
                validator: (v) => /^\d{17,19}$/.test(v),
                message: 'Invalid guild ID'
            }
        },
        reason: {
            type: String,
            maxlength: 512
        },
        moderatorId: {
            type: String,
            required: true,
            validate: {
                validator: (v) => /^\d{17,19}$/.test(v),
                message: 'Invalid moderator ID'
            }
        },
        date: { type: Date, default: Date.now },
        active: { type: Boolean, default: true }
    }],
    infractions: {
        type: Number,
        default: 0,
        min: 0
    },
    blacklisted: {
        type: Boolean,
        default: false
    },
    premium: {
        type: Boolean,
        default: false
    },
    mutedUntil: {
        type: Date,
        default: null
    },
    reputation: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

userSchema.index({ 'warnings.guildId': 1 });

export default mongoose.model('User', userSchema);