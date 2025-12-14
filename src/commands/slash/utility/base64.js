import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';

class Base64Command extends BaseCommand {
    constructor() {
        super({
            name: 'base64',
            description: 'Encode or decode base64 text',
            category: 'utility',
            cooldown: 2000
        });
    }

    async execute(interaction, client) {
        const action = interaction.options.getString('action');
        const text = interaction.options.getString('text');

        try {
            let result;
            if (action === 'encode') {
                result = Buffer.from(text, 'utf8').toString('base64');
            } else {
                result = Buffer.from(text, 'base64').toString('utf8');
            }

            const embed = CuteEmbedBuilder.success(
                `🔐 Base64 ${action === 'encode' ? 'Encoded' : 'Decoded'}`,
                `**Result:** \`${result}\``
            );

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Operation Failed', 'Invalid base64 text!')],
                ephemeral: true
            });
        }
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('action')
                    .setDescription('Encode or decode')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Encode', value: 'encode' },
                        { name: 'Decode', value: 'decode' }
                    ))
            .addStringOption(option =>
                option.setName('text')
                    .setDescription('Text to encode/decode')
                    .setRequired(true)
                    .setMaxLength(1000))
            .toJSON();
    }
}

export default new Base64Command();