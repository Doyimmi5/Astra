import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';
import Case from '../database/schemas/Case.js';
import { ModLogger } from '../helpers/modLogger.js';

export default {
    customId: 'ban_confirm',
    
    async execute(interaction, client) {
        const userId = interaction.customId.split('_')[2];
        const cacheKey = `ban_${userId}_${interaction.user.id}`;
        const banData = client.cache.get(cacheKey);
        
        if (!banData) {
            return interaction.reply({
                embeds: [CuteEmbedBuilder.error('Session Expired', 'This ban confirmation has expired!')],
                ephemeral: true
            });
        }
        
        try {
            await interaction.guild.members.ban(banData.user, {
                reason: banData.reason,
                deleteMessageDays: banData.deleteMessages
            });
            
            // Create case
            await Case.create({
                guildId: interaction.guild.id,
                userId: banData.user.id,
                moderatorId: interaction.user.id,
                type: 'ban',
                reason: banData.reason
            });
            
            // Log action
            await ModLogger.logAction(
                interaction.guild,
                'ban',
                banData.user,
                interaction.user,
                banData.reason
            );
            
            const embed = CuteEmbedBuilder.success(
                '🔨 User Banned',
                `**${banData.user.tag}** has been banned successfully!`
            );
            
            await interaction.update({ embeds: [embed], components: [] });
            client.cache.delete(cacheKey);
            
        } catch (error) {
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Ban Failed', `Failed to ban user: ${error.message}`)],
                ephemeral: true
            });
        }
    }
};