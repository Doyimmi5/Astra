import validator from 'validator';
import { PermissionsBitField } from 'discord.js';
import emojiRegex from 'emoji-regex';
import stringSimilarity from 'string-similarity';

export class Validators {
    static isValidUserId(id) {
        return /^\d{17,19}$/.test(id) && validator.isNumeric(id);
    }

    static isValidChannelId(id) {
        return /^\d{17,19}$/.test(id) && validator.isNumeric(id);
    }

    static isValidRoleId(id) {
        return /^\d{17,19}$/.test(id) && validator.isNumeric(id);
    }

    static isValidGuildId(id) {
        return /^\d{17,19}$/.test(id) && validator.isNumeric(id);
    }

    static isValidUrl(url) {
        return validator.isURL(url, {
            protocols: ['http', 'https'],
            require_protocol: true
        });
    }

    static isValidEmail(email) {
        return validator.isEmail(email);
    }

    static sanitizeInput(input) {
        return validator.escape(validator.trim(input));
    }

    static hasPermission(member, permission) {
        if (!member || !member.permissions) return false;
        return member.permissions.has(PermissionsBitField.Flags[permission]);
    }

    static isValidDuration(duration) {
        const regex = /^(\d+)([smhdw])$/;
        return regex.test(duration);
    }

    static isValidReason(reason) {
        if (!reason) return true;
        return reason.length <= 512 && !validator.contains(reason, '<script>');
    }

    static isValidMentionable(input) {
        const mentionRegex = /^<[@#&!]?(\d{17,19})>$/;
        return mentionRegex.test(input);
    }

    static containsEmoji(text) {
        const regex = emojiRegex();
        return regex.test(text);
    }

    static extractEmojis(text) {
        const regex = emojiRegex();
        return text.match(regex) || [];
    }

    static isSimilarString(str1, str2, threshold = 0.8) {
        return stringSimilarity.compareTwoStrings(str1, str2) >= threshold;
    }

    static isValidHexColor(color) {
        return validator.isHexColor(color);
    }

    static isValidJSON(str) {
        return validator.isJSON(str);
    }

    static isValidBase64(str) {
        return validator.isBase64(str);
    }

    static isSpam(message, threshold = 0.9) {
        const words = message.split(' ');
        if (words.length < 3) return false;
        
        let similarCount = 0;
        for (let i = 0; i < words.length - 1; i++) {
            if (this.isSimilarString(words[i], words[i + 1], threshold)) {
                similarCount++;
            }
        }
        
        return similarCount / (words.length - 1) > 0.5;
    }
}