import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';
import ClearCommand from '../commands/moderation/clear.js';
import { ModLogger } from '../helpers/modLogger.js';

export default {
    customId: 'clear_confirm',
    
    async execute(interaction, client) {
        const [, , amount, targetUserId] = interaction.customId.split('_');
        const clearData = client.cache.get(`clear_${interaction.user.id}`);
        
        if (!clearData) {
            return interaction.reply({
                embeds: [CuteEmbedBuilder.error('Session Expired', 'This clear confirmation has expired!')],
                ephemeral: true
            });
        }
        
        const targetUser = targetUserId !== 'all' ? await client.users.fetch(targetUserId) : null;
        
        await ClearCommand.executeClear(
            interaction, 
            client, 
            parseInt(amount), 
            targetUser, 
            clearData.reason
        );
        
        // Log action
        await ModLogger.logAction(
            interaction.guild,
            'clear',
            targetUser || { tag: 'All Users', id: 'all' },
            interaction.user,
            `Cleared ${amount} messages`
        );
        
        client.cache.delete(`clear_${interaction.user.id}`);
    }
};