import { Collection } from 'discord.js';
import { Validators } from '../helpers/validators.js';
import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';
import stringSimilarity from 'string-similarity';

export class AntiSpamMiddleware {
    constructor() {
        this.messageCache = new Collection();
        this.spamCache = new Collection();
        this.maxMessages = 5;
        this.timeWindow = 5000; // 5 seconds
        this.similarityThreshold = 0.8;
    }

    async checkSpam(message) {
        const userId = message.author.id;
        const guildId = message.guild?.id;
        
        if (!guildId || message.author.bot) return false;
        
        const key = `${guildId}-${userId}`;
        const now = Date.now();
        
        // Get user's recent messages
        let userMessages = this.messageCache.get(key) || [];
        
        // Remove old messages outside time window
        userMessages = userMessages.filter(msg => now - msg.timestamp < this.timeWindow);
        
        // Add current message
        userMessages.push({
            content: message.content,
            timestamp: now
        });
        
        // Update cache
        this.messageCache.set(key, userMessages);
        
        // Check for spam patterns
        if (await this.detectSpam(userMessages, message)) {
            return true;
        }
        
        return false;
    }

    async detectSpam(messages, currentMessage) {
        if (messages.length < this.maxMessages) return false;
        
        // Check for rapid messaging
        const recentMessages = messages.slice(-this.maxMessages);
        const timeSpan = recentMessages[recentMessages.length - 1].timestamp - recentMessages[0].timestamp;
        
        if (timeSpan < this.timeWindow) {
            // Check for similar content
            const contents = recentMessages.map(msg => msg.content);
            let similarCount = 0;
            
            for (let i = 0; i < contents.length - 1; i++) {
                for (let j = i + 1; j < contents.length; j++) {
                    if (stringSimilarity.compareTwoStrings(contents[i], contents[j]) >= this.similarityThreshold) {
                        similarCount++;
                    }
                }
            }
            
            // If more than half the messages are similar, it's spam
            if (similarCount >= Math.floor(contents.length / 2)) {
                await this.handleSpam(currentMessage);
                return true;
            }
        }
        
        return false;
    }

    async handleSpam(message) {
        const userId = message.author.id;
        const guildId = message.guild.id;
        const spamKey = `${guildId}-${userId}`;
        
        // Check if user is already being handled for spam
        if (this.spamCache.has(spamKey)) return;
        
        // Mark user as spam detected
        this.spamCache.set(spamKey, Date.now());
        
        try {
            // Delete recent messages
            const userMessages = this.messageCache.get(spamKey) || [];
            const messagesToDelete = userMessages.slice(-this.maxMessages);
            
            for (const msgData of messagesToDelete) {
                try {
                    const channel = message.channel;
                    const messages = await channel.messages.fetch({ limit: 50 });
                    const targetMessage = messages.find(m => 
                        m.author.id === userId && 
                        Math.abs(m.createdTimestamp - msgData.timestamp) < 1000
                    );
                    
                    if (targetMessage && targetMessage.deletable) {
                        await targetMessage.delete();
                    }
                } catch (error) {
                    // Ignore deletion errors
                }
            }
            
            // Send warning
            const embed = CuteEmbedBuilder.warning(
                'Spam Detected',
                `${message.author}, please slow down! Your recent messages have been deleted for spam. 🌸`
            );
            
            const warningMsg = await message.channel.send({ embeds: [embed] });
            
            // Auto-delete warning after 10 seconds
            setTimeout(() => {
                if (warningMsg.deletable) {
                    warningMsg.delete().catch(() => {});
                }
            }, 10000);
            
        } catch (error) {
            console.error('Anti-spam error:', error);
        }
        
        // Clear spam flag after 30 seconds
        setTimeout(() => {
            this.spamCache.delete(spamKey);
        }, 30000);
    }

    clearUserCache(guildId, userId) {
        const key = `${guildId}-${userId}`;
        this.messageCache.delete(key);
        this.spamCache.delete(key);
    }

    isUserSpamFlagged(guildId, userId) {
        const key = `${guildId}-${userId}`;
        return this.spamCache.has(key);
    }
}