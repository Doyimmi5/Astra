import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import axios from 'axios';

class ShortenCommand extends BaseCommand {
    constructor() {
        super({
            name: 'shorten',
            description: 'Shorten a URL',
            category: 'utility',
            cooldown: 5000
        });
    }

    async execute(interaction, client) {
        const url = interaction.options.getString('url');
        
        if (!this.isValidUrl(url)) {
            return interaction.reply({
                embeds: [CuteEmbedBuilder.error('Invalid URL', 'Please provide a valid URL!')],
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            const response = await axios.post('https://is.gd/create.php', null, {
                params: {
                    format: 'simple',
                    url: url
                }
            });

            const shortUrl = response.data;
            
            const embed = CuteEmbedBuilder.success(
                '🔗 URL Shortened',
                `**Original:** ${url}\n**Shortened:** ${shortUrl}`
            );

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            await interaction.editReply({
                embeds: [CuteEmbedBuilder.error('Shortening Failed', 'Could not shorten the URL! 💔')]
            });
        }
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('url')
                    .setDescription('URL to shorten')
                    .setRequired(true))
            .toJSON();
    }
}

export default new ShortenCommand();