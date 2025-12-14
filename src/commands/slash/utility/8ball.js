import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import _ from 'lodash';

class EightBallCommand extends BaseCommand {
    constructor() {
        super({
            name: 'eightball',
            description: 'Ask the magic 8-ball a question',
            category: 'utility',
            cooldown: 2000
        });
    }

    async execute(interaction, client) {
        const question = interaction.options.getString('question');

        const responses = [
            // Positive
            'Yes, absolutely! 💖',
            'Of course, cutie! ✨',
            'Definitely yes! 🌸',
            'I believe so! 💕',
            'Yes, without a doubt! 🦄',
            'Absolutely! 🌈',
            'Yes, and it\'ll be amazing! ✨',
            
            // Negative
            'No, sorry sweetie 💔',
            'I don\'t think so... 😔',
            'Probably not 🥺',
            'No way! 😤',
            'Definitely not 💔',
            'Nope, not happening 😅',
            
            // Neutral/Maybe
            'Maybe... 🤔',
            'Ask me later! 💭',
            'I\'m not sure about that one 😊',
            'It\'s possible! 🌟',
            'Could go either way 🤷‍♀️',
            'The future is unclear 🔮',
            'Perhaps... 💫',
            'Only time will tell! ⏰'
        ];

        const response = _.sample(responses);
        
        const ballEmbed = CuteEmbedBuilder.info(
            '🔮 Magic 8-Ball',
            `**Question:** ${question}\n\n**Answer:** ${response}`
        );

        ballEmbed.setFooter({ text: 'The magic 8-ball has spoken! ✨' });

        await interaction.reply({ embeds: [ballEmbed] });
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('question')
                    .setDescription('Ask the magic 8-ball anything!')
                    .setRequired(true)
                    .setMaxLength(200))
            .toJSON();
    }
}

export default new EightBallCommand();