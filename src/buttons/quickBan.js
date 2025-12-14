import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export default {
    customId: 'quick_ban',
    
    async execute(interaction, client) {
        const userId = interaction.customId.split('_')[2];
        
        const banModal = new ModalBuilder()
            .setCustomId(`ban_modal_${userId}`)
            .setTitle('Ban User');

        const reasonInput = new TextInputBuilder()
            .setCustomId('ban_reason')
            .setLabel('Ban Reason')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Enter the reason for this ban...')
            .setRequired(true)
            .setMaxLength(512);

        const deleteInput = new TextInputBuilder()
            .setCustomId('delete_days')
            .setLabel('Delete Messages (Days)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('0-7 days')
            .setRequired(false)
            .setMaxLength(1);

        const reasonRow = new ActionRowBuilder().addComponents(reasonInput);
        const deleteRow = new ActionRowBuilder().addComponents(deleteInput);
        
        banModal.addComponents(reasonRow, deleteRow);

        await interaction.showModal(banModal);
    }
};