import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export default {
    customId: 'quick_kick',
    
    async execute(interaction, client) {
        const userId = interaction.customId.split('_')[2];
        
        const kickModal = new ModalBuilder()
            .setCustomId(`kick_modal_${userId}`)
            .setTitle('Kick User');

        const reasonInput = new TextInputBuilder()
            .setCustomId('kick_reason')
            .setLabel('Kick Reason')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Enter the reason for this kick...')
            .setRequired(true)
            .setMaxLength(512);

        const reasonRow = new ActionRowBuilder().addComponents(reasonInput);
        kickModal.addComponents(reasonRow);

        await interaction.showModal(kickModal);
    }
};