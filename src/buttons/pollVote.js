import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';

export default {
    customId: 'poll_vote',
    
    async execute(interaction, client) {
        const optionIndex = parseInt(interaction.customId.split('_')[2]);
        const messageId = interaction.message.id;
        const pollData = client.cache.get(`poll_${messageId}`);
        
        if (!pollData) {
            return interaction.reply({
                embeds: [CuteEmbedBuilder.error('Poll Expired', 'This poll is no longer active!')],
                ephemeral: true
            });
        }

        const userId = interaction.user.id;
        
        // Remove previous vote
        Object.keys(pollData.votes).forEach(key => {
            if (pollData.votes[key].includes(userId)) {
                pollData.votes[key] = pollData.votes[key].filter(id => id !== userId);
            }
        });

        // Add new vote
        if (!pollData.votes[optionIndex]) pollData.votes[optionIndex] = [];
        pollData.votes[optionIndex].push(userId);

        // Update cache
        client.cache.set(`poll_${messageId}`, pollData);

        // Calculate results
        const emojis = ['🌸', '💖', '✨', '🦄'];
        const totalVotes = Object.values(pollData.votes).reduce((sum, votes) => sum + votes.length, 0);
        
        const resultsText = pollData.options.map((opt, i) => {
            const votes = pollData.votes[i]?.length || 0;
            const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
            const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
            return `${emojis[i]} **${opt}**\n${bar} ${votes} votes (${percentage}%)`;
        }).join('\n\n');

        const updatedEmbed = CuteEmbedBuilder.info(
            '📊 Poll Results',
            `**${pollData.question}**\n\n${resultsText}\n\n**Total Votes:** ${totalVotes}`
        );

        await interaction.update({ embeds: [updatedEmbed] });
    }
};