import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export default {
    customId: 'quick_mute',
    
    async execute(interaction, client) {
        const userId = interaction.customId.split('_')[2];
        
        const muteModal = new ModalBuilder()
            .setCustomId(`mute_modal_${userId}`)
            .setTitle('Mute User');

        const durationInput = new TextInputBuilder()
            .setCustomId('mute_duration')
            .setLabel('Duration')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('10m, 1h, 1d...')
            .setRequired(true)
            .setMaxLength(10);

        const reasonInput = new TextInputBuilder()
            .setCustomId('mute_reason')
            .setLabel('Reason')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Enter the reason for this mute...')
            .setRequired(true)
            .setMaxLength(512);

        const durationRow = new ActionRowBuilder().addComponents(durationInput);
        const reasonRow = new ActionRowBuilder().addComponents(reasonInput);
        
        muteModal.addComponents(durationRow, reasonRow);

        await interaction.showModal(muteModal);
    }
};