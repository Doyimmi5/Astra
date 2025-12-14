import mongoose from 'mongoose';
import validator from 'validator';

const guildSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (v) => /^\d{17,19}$/.test(v),
            message: 'Invalid guild ID'
        }
    },
    prefix: {
        type: String,
        default: '!',
        maxlength: 5
    },
    modLogChannel: {
        type: String,
        default: null,
        validate: {
            validator: function(v) {
                return !v || /^\d{17,19}$/.test(v);
            },
            message: 'Invalid channel ID'
        }
    },
    muteRole: {
        type: String,
        default: null,
        validate: {
            validator: function(v) {
                return !v || /^\d{17,19}$/.test(v);
            },
            message: 'Invalid role ID'
        }
    },
    automod: {
        enabled: { type: Boolean, default: false },
        antiSpam: { type: Boolean, default: false },
        antiRaid: { type: Boolean, default: false },
        autoDelete: { type: Boolean, default: false }
    },
    welcomeChannel: {
        type: String,
        default: null,
        validate: {
            validator: function(v) {
                return !v || /^\d{17,19}$/.test(v);
            },
            message: 'Invalid channel ID'
        }
    },
    language: {
        type: String,
        default: 'en',
        enum: ['en', 'es', 'fr', 'de', 'ja', 'ko']
    },
    moderationSettings: {
        maxWarns: { type: Number, default: 3, min: 1, max: 10 },
        muteTime: { type: Number, default: 600000, min: 60000 },
        autoModerate: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});



export default mongoose.model('Guild', guildSchema);