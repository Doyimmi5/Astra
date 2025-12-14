import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

class SuggestCommand extends BaseCommand {
    constructor() {
        super({
            name: 'suggest',
            description: 'Submit a suggestion for the server',
            category: 'utility',
            cooldown: 30000
        });
    }

    async execute(interaction, client) {
        const suggestion = interaction.options.getString('suggestion');

        const suggestionEmbed = CuteEmbedBuilder.info(
            '💡 New Suggestion',
            suggestion
        );

        suggestionEmbed.addFields([
            { name: 'Suggested by', value: interaction.user.toString(), inline: true },
            { name: 'Status', value: '⏳ Pending', inline: true },
            { name: 'Votes', value: '👍 0 | 👎 0', inline: true }
        ]);

        const voteButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('suggestion_upvote')
                    .setLabel('Upvote')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('👍'),
                new ButtonBuilder()
                    .setCustomId('suggestion_downvote')
                    .setLabel('Downvote')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('👎')
            );

        // Try to find suggestions channel
        const suggestionsChannel = interaction.guild.channels.cache.find(c => 
            c.name.includes('suggest') || c.name.includes('idea')
        ) || interaction.channel;

        const suggestionMsg = await suggestionsChannel.send({ 
            embeds: [suggestionEmbed], 
            components: [voteButtons] 
        });

        // Store suggestion data
        client.cache.set(`suggestion_${suggestionMsg.id}`, {
            suggestion,
            author: interaction.user.id,
            upvotes: [],
            downvotes: [],
            status: 'pending'
        });

        const confirmEmbed = CuteEmbedBuilder.success(
            'Suggestion Submitted!',
            `Your suggestion has been posted in ${suggestionsChannel}! 💖`
        );

        await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('suggestion')
                    .setDescription('Your suggestion for the server')
                    .setRequired(true)
                    .setMaxLength(1000))
            .toJSON();
    }
}

export default new SuggestCommand();