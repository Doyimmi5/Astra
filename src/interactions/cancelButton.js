import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';

export default {
    customId: 'cancel',
    
    async execute(interaction, client) {
        const embed = CuteEmbedBuilder.info(
            '❌ Action Cancelled',
            'The operation has been cancelled successfully!'
        );
        
        await interaction.update({ embeds: [embed], components: [] });
    }
};