import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import crypto from 'crypto';

class HashCommand extends BaseCommand {
    constructor() {
        super({
            name: 'hash',
            description: 'Generate hash of text',
            category: 'utility',
            cooldown: 2000
        });
    }

    async execute(interaction, client) {
        const algorithm = interaction.options.getString('algorithm');
        const text = interaction.options.getString('text');

        const hash = crypto.createHash(algorithm).update(text).digest('hex');

        const embed = CuteEmbedBuilder.success(
            `🔐 ${algorithm.toUpperCase()} Hash`,
            `**Input:** ${text}\n**Hash:** \`${hash}\``
        );

        await interaction.reply({ embeds: [embed] });
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('algorithm')
                    .setDescription('Hash algorithm')
                    .setRequired(true)
                    .addChoices(
                        { name: 'MD5', value: 'md5' },
                        { name: 'SHA1', value: 'sha1' },
                        { name: 'SHA256', value: 'sha256' },
                        { name: 'SHA512', value: 'sha512' }
                    ))
            .addStringOption(option =>
                option.setName('text')
                    .setDescription('Text to hash')
                    .setRequired(true)
                    .setMaxLength(500))
            .toJSON();
    }
}

export default new HashCommand();