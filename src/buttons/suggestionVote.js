import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';

export default {
    customId: 'suggestion',
    
    async execute(interaction, client) {
        const voteType = interaction.customId.split('_')[1]; // upvote or downvote
        const messageId = interaction.message.id;
        const suggestionData = client.cache.get(`suggestion_${messageId}`);
        
        if (!suggestionData) {
            return interaction.reply({
                embeds: [CuteEmbedBuilder.error('Suggestion Not Found', 'This suggestion is no longer active!')],
                ephemeral: true
            });
        }

        const userId = interaction.user.id;
        
        // Remove previous votes
        suggestionData.upvotes = suggestionData.upvotes.filter(id => id !== userId);
        suggestionData.downvotes = suggestionData.downvotes.filter(id => id !== userId);
        
        // Add new vote
        if (voteType === 'upvote') {
            suggestionData.upvotes.push(userId);
        } else {
            suggestionData.downvotes.push(userId);
        }
        
        // Update cache
        client.cache.set(`suggestion_${messageId}`, suggestionData);
        
        // Update embed
        const embed = interaction.message.embeds[0];
        const updatedEmbed = CuteEmbedBuilder.info(embed.title, embed.description);
        
        updatedEmbed.addFields([
            { name: 'Suggested by', value: `<@${suggestionData.author}>`, inline: true },
            { name: 'Status', value: '⏳ Pending', inline: true },
            { name: 'Votes', value: `👍 ${suggestionData.upvotes.length} | 👎 ${suggestionData.downvotes.length}`, inline: true }
        ]);

        await interaction.update({ embeds: [updatedEmbed] });
        
        const voteEmbed = CuteEmbedBuilder.success(
            'Vote Recorded!',
            `Your ${voteType} has been recorded! 💖`
        );
        
        await interaction.followUp({ embeds: [voteEmbed], ephemeral: true });
    }
};