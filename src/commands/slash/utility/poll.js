import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

class PollCommand extends BaseCommand {
    constructor() {
        super({
            name: 'poll',
            description: 'Create a cute poll with reactions',
            category: 'utility',
            cooldown: 5000
        });
    }

    async execute(interaction, client) {
        const question = interaction.options.getString('question');
        const option1 = interaction.options.getString('option1');
        const option2 = interaction.options.getString('option2');
        const option3 = interaction.options.getString('option3');
        const option4 = interaction.options.getString('option4');

        const options = [option1, option2, option3, option4].filter(Boolean);
        const emojis = ['🌸', '💖', '✨', '🦄'];

        const pollEmbed = CuteEmbedBuilder.info(
            '📊 Poll Time!',
            `**${question}**\n\n${options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n')}`
        );

        pollEmbed.addFields({ name: 'Created by', value: interaction.user.toString(), inline: true });

        const pollButtons = new ActionRowBuilder()
            .addComponents(
                ...options.map((opt, i) => 
                    new ButtonBuilder()
                        .setCustomId(`poll_vote_${i}`)
                        .setLabel(opt)
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(emojis[i])
                )
            );

        const message = await interaction.reply({ embeds: [pollEmbed], components: [pollButtons], fetchReply: true });

        // Store poll data
        client.cache.set(`poll_${message.id}`, {
            question,
            options,
            votes: {},
            creator: interaction.user.id
        });
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('question')
                    .setDescription('The poll question')
                    .setRequired(true)
                    .setMaxLength(256))
            .addStringOption(option =>
                option.setName('option1')
                    .setDescription('First option')
                    .setRequired(true)
                    .setMaxLength(100))
            .addStringOption(option =>
                option.setName('option2')
                    .setDescription('Second option')
                    .setRequired(true)
                    .setMaxLength(100))
            .addStringOption(option =>
                option.setName('option3')
                    .setDescription('Third option')
                    .setMaxLength(100))
            .addStringOption(option =>
                option.setName('option4')
                    .setDescription('Fourth option')
                    .setMaxLength(100))
            .toJSON();
    }
}

export default new PollCommand();