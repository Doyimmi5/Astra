import { EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const config = JSON.parse(readFileSync(path.join(__dirname, '../config/config.json'), 'utf8'));
import tinycolor from 'tinycolor2';
import _ from 'lodash';
import emojiRegex from 'emoji-regex';

export class CuteEmbedBuilder {
    static getRandomFooter() {
        const footers = [
            'Made with 💖 by Astra • Licensed under Apache 2.0',
            'Keeping servers cute and safe! uwu 🌸',
            'Moderation made adorable ~ ✨',
            'Your friendly femboy moderator! >.<',
            'Protecting with love and care 💕',
            'Astra Bot • Professional yet cute! 🥰'
        ];
        return _.sample(footers);
    }

    static getRandomEmoji() {
        const emojis = ['💖', '✨', '🌸', '💕', '🦄', '🌈', '💫', '🎀'];
        return _.sample(emojis);
    }

    static success(title, description, fields = []) {
        const color = tinycolor(config.colors.success).lighten(5).toHexString();
        return new EmbedBuilder()
            .setColor(color)
            .setTitle(`${config.emojis.success} ${title}`)
            .setDescription(description)
            .addFields(fields)
            .setFooter({ text: this.getRandomFooter() })
            .setTimestamp();
    }

    static error(title, description, fields = []) {
        const color = tinycolor(config.colors.error).darken(5).toHexString();
        return new EmbedBuilder()
            .setColor(color)
            .setTitle(`${config.emojis.error} ${title}`)
            .setDescription(description)
            .addFields(fields)
            .setFooter({ text: 'Oopsie! Something went wrong >.<' })
            .setTimestamp();
    }

    static info(title, description, fields = []) {
        const color = tinycolor(config.colors.info).saturate(10).toHexString();
        return new EmbedBuilder()
            .setColor(color)
            .setTitle(`${config.emojis.info} ${title}`)
            .setDescription(description)
            .addFields(fields)
            .setFooter({ text: 'Astra is here to help! uwu 🌸' })
            .setTimestamp();
    }

    static moderation(action, user, moderator, reason, duration = null) {
        const actionEmoji = config.emojis[action] || '⚡';
        const actionColor = config.colors[action] || config.colors.primary;
        const color = tinycolor(actionColor).lighten(10).toHexString();
        
        const fields = [
            { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
            { name: 'Moderator', value: `${moderator.tag}`, inline: true },
            { name: 'Reason', value: reason || 'No reason provided', inline: false }
        ];

        if (duration) {
            fields.push({ name: 'Duration', value: duration, inline: true });
        }
        
        return new EmbedBuilder()
            .setColor(color)
            .setTitle(`${actionEmoji} ${_.capitalize(action)} Action`)
            .addFields(fields)
            .setThumbnail(user.displayAvatarURL())
            .setFooter({ text: `Moderation by Astra ${this.getRandomEmoji()}` })
            .setTimestamp();
    }

    static warning(title, description, fields = []) {
        const color = tinycolor(config.colors.warning).saturate(15).toHexString();
        return new EmbedBuilder()
            .setColor(color)
            .setTitle(`${config.emojis.warning} ${title}`)
            .setDescription(description)
            .addFields(fields)
            .setFooter({ text: 'Please be careful! >.< ✨' })
            .setTimestamp();
    }

    static caseEmbed(caseData) {
        const actionEmoji = config.emojis[caseData.type] || '📋';
        const color = tinycolor(config.colors.primary).spin(30).toHexString();
        
        return new EmbedBuilder()
            .setColor(color)
            .setTitle(`${actionEmoji} Case #${caseData.caseId.slice(0, 8)}`)
            .addFields([
                { name: 'Type', value: _.capitalize(caseData.type), inline: true },
                { name: 'User ID', value: caseData.userId, inline: true },
                { name: 'Moderator ID', value: caseData.moderatorId, inline: true },
                { name: 'Reason', value: caseData.reason, inline: false },
                { name: 'Date', value: `<t:${Math.floor(new Date(caseData.createdAt).getTime() / 1000)}:F>`, inline: true },
                { name: 'Active', value: caseData.active ? 'Yes' : 'No', inline: true }
            ])
            .setFooter({ text: this.getRandomFooter() })
            .setTimestamp();
    }
}