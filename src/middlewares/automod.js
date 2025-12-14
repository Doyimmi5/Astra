import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';

export class AutoMod {
    static badWords = ['spam', 'scam', 'hack'];
    static spamCache = new Map();

    static async checkMessage(message) {
        if (message.author.bot) return false;
        
        // Anti-spam
        if (this.isSpam(message)) {
            await message.delete();
            await message.channel.send({
                embeds: [CuteEmbedBuilder.warning('Anti-Spam', `${message.author}, please don't spam! 💔`)],
                ephemeral: true
            });
            return true;
        }

        // Bad words filter
        if (this.hasBadWords(message.content)) {
            await message.delete();
            await message.channel.send({
                embeds: [CuteEmbedBuilder.warning('Auto-Mod', `${message.author}, watch your language! 😤`)],
                ephemeral: true
            });
            return true;
        }

        return false;
    }

    static isSpam(message) {
        const userId = message.author.id;
        const now = Date.now();
        
        if (!this.spamCache.has(userId)) {
            this.spamCache.set(userId, []);
        }
        
        const userMessages = this.spamCache.get(userId);
        userMessages.push(now);
        
        // Remove messages older than 5 seconds
        const filtered = userMessages.filter(time => now - time < 5000);
        this.spamCache.set(userId, filtered);
        
        return filtered.length > 5;
    }

    static hasBadWords(content) {
        return this.badWords.some(word => 
            content.toLowerCase().includes(word.toLowerCase())
        );
    }
}