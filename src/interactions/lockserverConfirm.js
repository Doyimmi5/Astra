import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';
import LockserverCommand from '../commands/moderation/lockserver.js';

export default {
    customId: 'lockserver_confirm',
    type: 'button',
    
    async execute(interaction, client) {
        const cacheKey = `lockserver_${interaction.user.id}`;
        const lockdownData = client.cache.get(cacheKey);
        
        if (!lockdownData) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Session Expired', 'This lockdown confirmation has expired!')],
                ephemeral: true
            });
        }

        await LockserverCommand.executeLockdown(
            interaction,
            client,
            lockdownData.reason,
            lockdownData.moderator
        );

        // Clean up cache
        client.cache.delete(cacheKey);
    }
};