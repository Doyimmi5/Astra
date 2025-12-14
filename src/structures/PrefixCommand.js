import { v4 as uuidv4 } from 'uuid';
import { PermissionChecker } from '../helpers/permissionChecker.js';

export default class PrefixCommand {
    constructor(options = {}) {
        this.name = options.name || 'unknown';
        this.description = options.description || 'No description';
        this.usage = options.usage || this.name;
        this.aliases = options.aliases || [];
        this.category = options.category || 'general';
        this.requiredLevel = options.requiredLevel || 0;
        this.ownerOnly = options.ownerOnly || false;
        this.guildOnly = options.guildOnly || true;
        this.cooldown = options.cooldown || 3000;
        this.id = uuidv4();
    }

    async execute(message, args, client) {
        throw new Error(`Prefix command ${this.name} doesn't have an execute method!`);
    }

    async checkPermissions(message, client) {
        if (this.ownerOnly) {
            const userLevel = PermissionChecker.getUserLevel(message.author, message.guild);
            return userLevel.level >= 10;
        }

        if (this.requiredLevel > 0) {
            const userLevel = PermissionChecker.getUserLevel(message.author, message.guild);
            return userLevel.level >= this.requiredLevel;
        }

        return true;
    }
}