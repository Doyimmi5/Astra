import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';

class QRCommand extends BaseCommand {
    constructor() {
        super({
            name: 'qr',
            description: 'Generate a QR code',
            category: 'utility',
            cooldown: 3000
        });
    }

    async execute(interaction, client) {
        const text = interaction.options.getString('text');
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
        
        const embed = CuteEmbedBuilder.success(
            '📱 QR Code Generated',
            `QR code for: **${text}**`
        );
        
        embed.setImage(qrUrl);
        await interaction.reply({ embeds: [embed] });
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('text')
                    .setDescription('Text to encode')
                    .setRequired(true)
                    .setMaxLength(500))
            .toJSON();
    }
}

export default new QRCommand();