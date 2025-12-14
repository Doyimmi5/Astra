import { SlashCommandBuilder } from '@discordjs/builders';
import ms from 'ms';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export default class BaseCommand {
    constructor(options = {}) {
        this.name = options.name || 'unknown';
        this.description = options.description || 'No description';
        this.category = options.category || 'moderation';
        this.permissions = options.permissions || [];
        this.botPermissions = options.botPermissions || [];
        this.cooldown = options.cooldown || 3000;
        this.ownerOnly = options.ownerOnly || false;
        this.guildOnly = options.guildOnly || true;
        this.nsfw = options.nsfw || false;
        this.id = uuidv4();
        this.hash = crypto.createHash('md5').update(this.name).digest('hex');
    }

    async execute(interaction, client) {
        throw new Error(`Command ${this.name} doesn't have an execute method!`);
    }

    async checkPermissions(interaction, client) {
        if (this.ownerOnly && interaction.user.id !== process.env.OWNER_ID) {
            return { success: false, message: 'This command is owner only!' };
        }

        if (this.guildOnly && !interaction.guild) {
            return { success: false, message: 'This command can only be used in servers!' };
        }

        if (this.permissions.length > 0) {
            const member = interaction.guild?.members.cache.get(interaction.user.id);
            if (!member?.permissions.has(this.permissions)) {
                return { success: false, message: 'You don\'t have permission to use this command!' };
            }
        }

        return { success: true };
    }

    async checkCooldown(interaction, client) {
        const cooldownKey = `${this.name}-${interaction.user.id}`;
        const cooldownTime = client.cooldowns.get(cooldownKey);
        
        if (cooldownTime && Date.now() < cooldownTime) {
            const timeLeft = ms(cooldownTime - Date.now(), { long: true });
            return { onCooldown: true, timeLeft };
        }

        client.cooldowns.set(cooldownKey, Date.now() + this.cooldown);
        return { onCooldown: false };
    }

    toJSON() {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
        
        return builder.toJSON();
    }
}