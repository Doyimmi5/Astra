import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';

export default {
    customId: 'report_modal',
    
    async execute(interaction, client) {
        const reportType = interaction.fields.getTextInputValue('report_type');
        const reportReason = interaction.fields.getTextInputValue('report_reason');
        const reportDetails = interaction.fields.getTextInputValue('report_details');
        
        const reportEmbed = CuteEmbedBuilder.warning(
            '📋 New Report Submitted',
            'A user has submitted a report'
        );

        reportEmbed.addFields([
            { name: 'Reporter', value: interaction.user.tag, inline: true },
            { name: 'Type', value: reportType, inline: true },
            { name: 'Server', value: interaction.guild.name, inline: true },
            { name: 'Reason', value: reportReason, inline: false },
            { name: 'Details', value: reportDetails || 'No additional details', inline: false }
        ]);

        // Send to mod log channel if configured
        const modLogChannel = interaction.guild.channels.cache.find(c => c.name === 'mod-logs');
        if (modLogChannel) {
            await modLogChannel.send({ embeds: [reportEmbed] });
        }

        const confirmEmbed = CuteEmbedBuilder.success(
            'Report Submitted',
            'Your report has been submitted to the moderation team! 💖'
        );

        await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
    }
};