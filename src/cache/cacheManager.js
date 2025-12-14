import { Collection } from 'discord.js';
import Enmap from 'enmap';
import { QuickDB } from 'quick.db';
import _ from 'lodash';

export class CacheManager {
    constructor(client) {
        this.client = client;
        this.memory = new Collection();
        this.persistent = new Enmap();
        this.db = new QuickDB();
        
        this.guilds = new Collection();
        this.users = new Collection();
        this.channels = new Collection();
        this.roles = new Collection();
        this.messages = new Collection();
        
        this.setupCleanup();
    }

    // Memory cache operations
    set(key, value, ttl = null) {
        this.memory.set(key, {
            value,
            timestamp: Date.now(),
            ttl
        });
        
        if (ttl) {
            setTimeout(() => {
                this.memory.delete(key);
            }, ttl);
        }
    }

    get(key) {
        const cached = this.memory.get(key);
        if (!cached) return null;
        
        if (cached.ttl && Date.now() - cached.timestamp > cached.ttl) {
            this.memory.delete(key);
            return null;
        }
        
        return cached.value;
    }

    has(key) {
        return this.memory.has(key);
    }

    delete(key) {
        return this.memory.delete(key);
    }

    // Persistent cache operations
    async setPersistent(key, value) {
        this.persistent.set(key, value);
        await this.db.set(key, value);
    }

    async getPersistent(key) {
        let value = this.persistent.get(key);
        if (!value) {
            value = await this.db.get(key);
            if (value) {
                this.persistent.set(key, value);
            }
        }
        return value;
    }

    async deletePersistent(key) {
        this.persistent.delete(key);
        await this.db.delete(key);
    }

    // Guild cache
    cacheGuild(guild) {
        const guildData = {
            id: guild.id,
            name: guild.name,
            memberCount: guild.memberCount,
            ownerId: guild.ownerId,
            features: guild.features,
            cached: Date.now()
        };
        
        this.guilds.set(guild.id, guildData);
        return guildData;
    }

    getGuild(guildId) {
        return this.guilds.get(guildId);
    }

    // User cache
    cacheUser(user) {
        const userData = {
            id: user.id,
            tag: user.tag,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar,
            bot: user.bot,
            cached: Date.now()
        };
        
        this.users.set(user.id, userData);
        return userData;
    }

    getUser(userId) {
        return this.users.get(userId);
    }

    // Channel cache
    cacheChannel(channel) {
        const channelData = {
            id: channel.id,
            name: channel.name,
            type: channel.type,
            guildId: channel.guildId,
            parentId: channel.parentId,
            cached: Date.now()
        };
        
        this.channels.set(channel.id, channelData);
        return channelData;
    }

    getChannel(channelId) {
        return this.channels.get(channelId);
    }

    // Role cache
    cacheRole(role) {
        const roleData = {
            id: role.id,
            name: role.name,
            color: role.color,
            position: role.position,
            permissions: role.permissions.bitfield.toString(),
            guildId: role.guild.id,
            cached: Date.now()
        };
        
        this.roles.set(role.id, roleData);
        return roleData;
    }

    getRole(roleId) {
        return this.roles.get(roleId);
    }

    // Message cache (limited)
    cacheMessage(message, ttl = 300000) { // 5 minutes default
        const messageData = {
            id: message.id,
            content: message.content,
            authorId: message.author.id,
            channelId: message.channel.id,
            guildId: message.guild?.id,
            timestamp: message.createdTimestamp,
            cached: Date.now()
        };
        
        this.messages.set(message.id, messageData);
        
        // Auto-cleanup after TTL
        setTimeout(() => {
            this.messages.delete(message.id);
        }, ttl);
        
        return messageData;
    }

    getMessage(messageId) {
        return this.messages.get(messageId);
    }

    // Cleanup operations
    setupCleanup() {
        // Clean expired memory cache every 5 minutes
        setInterval(() => {
            this.cleanExpiredCache();
        }, 300000);
        
        // Clean old cached data every hour
        setInterval(() => {
            this.cleanOldCache();
        }, 3600000);
    }

    cleanExpiredCache() {
        let cleaned = 0;
        
        for (const [key, data] of this.memory) {
            if (data.ttl && Date.now() - data.timestamp > data.ttl) {
                this.memory.delete(key);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            this.client.log(`Cleaned ${cleaned} expired cache entries`, 'debug');
        }
    }

    cleanOldCache(maxAge = 3600000) { // 1 hour default
        const collections = [this.guilds, this.users, this.channels, this.roles];
        let totalCleaned = 0;
        
        collections.forEach(collection => {
            const toDelete = [];
            
            for (const [key, data] of collection) {
                if (Date.now() - data.cached > maxAge) {
                    toDelete.push(key);
                }
            }
            
            toDelete.forEach(key => collection.delete(key));
            totalCleaned += toDelete.length;
        });
        
        if (totalCleaned > 0) {
            this.client.log(`Cleaned ${totalCleaned} old cache entries`, 'debug');
        }
    }

    // Statistics
    getStats() {
        return {
            memory: this.memory.size,
            persistent: this.persistent.size,
            guilds: this.guilds.size,
            users: this.users.size,
            channels: this.channels.size,
            roles: this.roles.size,
            messages: this.messages.size
        };
    }

    // Clear all cache
    clearAll() {
        this.memory.clear();
        this.guilds.clear();
        this.users.clear();
        this.channels.clear();
        this.roles.clear();
        this.messages.clear();
        
        this.client.log('All cache cleared', 'info');
    }
}

export default CacheManager;