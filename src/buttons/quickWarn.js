import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export default {
    customId: 'quick_warn',
    
    async execute(interaction, client) {
        const userId = interaction.customId.split('_')[2];
        
        const warnModal = new ModalBuilder()
            .setCustomId(`warn_modal_${userId}`)
            .setTitle('Warn User');

        const reasonInput = new TextInputBuilder()
            .setCustomId('warn_reason')
            .setLabel('Warning Reason')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Enter the reason for this warning...')
            .setRequired(true)
            .setMaxLength(512);

        const reasonRow = new ActionRowBuilder().addComponents(reasonInput);
        warnModal.addComponents(reasonRow);

        await interaction.showModal(warnModal);
    }
};