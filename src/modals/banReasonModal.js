import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';
import Case from '../database/schemas/Case.js';

export default {
    customId: 'ban_reason_modal',
    
    async execute(interaction, client) {
        const userId = interaction.customId.split('_')[3];
        const reason = interaction.fields.getTextInputValue('ban_reason');
        const deleteMessages = interaction.fields.getTextInputValue('delete_days') || '1';
        
        try {
            const user = await client.users.fetch(userId);
            
            await interaction.guild.members.ban(userId, {
                reason: `Banned by ${interaction.user.tag}: ${reason}`,
                deleteMessageDays: parseInt(deleteMessages)
            });

            const newCase = new Case({
                guildId: interaction.guild.id,
                userId: userId,
                moderatorId: interaction.user.id,
                type: 'ban',
                reason: reason
            });
            await newCase.save();

            const banEmbed = CuteEmbedBuilder.moderation('ban', user, interaction.user, reason);
            banEmbed.addFields({ name: 'Case ID', value: newCase.caseId.slice(0, 8), inline: true });

            await interaction.reply({ embeds: [banEmbed] });

        } catch (error) {
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Ban Failed', `Failed to ban user: ${error.message}`)],
                ephemeral: true
            });
        }
    }
};