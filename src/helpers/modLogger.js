import { CuteEmbedBuilder } from './embedBuilder.js';

export class ModLogger {
    static async logAction(guild, action, user, moderator, reason, duration = null) {
        const logChannel = guild.channels.cache.find(c => 
            c.name === 'mod-logs' || 
            c.name === 'moderation-logs' ||
            c.name === 'logs'
        );
        
        if (!logChannel) return;

        const embed = CuteEmbedBuilder.moderation(action, user, moderator, reason, duration);
        embed.addFields({ name: 'Channel', value: `<#${logChannel.id}>`, inline: true });
        
        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.log(`Failed to send mod log: ${error.message}`);
        }
    }
}