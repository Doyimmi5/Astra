import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import axios from 'axios';

class TranslateCommand extends BaseCommand {
    constructor() {
        super({
            name: 'translate',
            description: 'Translate text to another language',
            category: 'utility',
            cooldown: 5000
        });
    }

    async execute(interaction, client) {
        const text = interaction.options.getString('text');
        const targetLang = interaction.options.getString('language') || 'en';

        if (text.length > 500) {
            return interaction.reply({
                embeds: [CuteEmbedBuilder.error('Text Too Long', 'Please keep text under 500 characters!')],
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            // Using a simple translation API (you can replace with Google Translate API)
            const response = await axios.get(`https://api.mymemory.translated.net/get`, {
                params: {
                    q: text,
                    langpair: `en|${targetLang}`
                }
            });

            const translatedText = response.data.responseData.translatedText;
            const translateEmbed = CuteEmbedBuilder.success(
                '🌐 Translation Complete!',
                `**Original:** ${text}\n\n**Translated:** ${translatedText}`
            );

            translateEmbed.addFields([
                { name: 'To Language', value: targetLang.toUpperCase(), inline: true }
            ]);

            await interaction.editReply({ embeds: [translateEmbed] });

        } catch (error) {
            await interaction.editReply({
                embeds: [CuteEmbedBuilder.error('Translation Failed', 'Sorry, I couldn\'t translate that text! 💔')]
            });
        }
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('text')
                    .setDescription('Text to translate')
                    .setRequired(true)
                    .setMaxLength(500))
            .addStringOption(option =>
                option.setName('language')
                    .setDescription('Target language (e.g., en, es, fr, de, ja)')
                    .addChoices(
                        { name: 'English', value: 'en' },
                        { name: 'Spanish', value: 'es' },
                        { name: 'French', value: 'fr' },
                        { name: 'German', value: 'de' },
                        { name: 'Japanese', value: 'ja' },
                        { name: 'Korean', value: 'ko' },
                        { name: 'Portuguese', value: 'pt' },
                        { name: 'Russian', value: 'ru' },
                        { name: 'Chinese', value: 'zh' },
                        { name: 'Italian', value: 'it' }
                    ))
            .toJSON();
    }
}

export default new TranslateCommand();