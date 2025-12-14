import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';

class ColorCommand extends BaseCommand {
    constructor() {
        super({
            name: 'color',
            description: 'Display color information',
            category: 'utility',
            cooldown: 2000
        });
    }

    async execute(interaction, client) {
        const color = interaction.options.getString('color').replace('#', '');
        
        if (!/^[0-9A-F]{6}$/i.test(color)) {
            return interaction.reply({
                embeds: [CuteEmbedBuilder.error('Invalid Color', 'Please provide a valid hex color!')],
                ephemeral: true
            });
        }

        const embed = CuteEmbedBuilder.info(
            `🎨 Color: #${color.toUpperCase()}`,
            `Here's your color information! 💖`
        );
        
        embed.setColor(`#${color}`);
        embed.setThumbnail(`https://singlecolorimage.com/get/${color}/100x100`);
        embed.addFields([
            { name: 'Hex', value: `#${color.toUpperCase()}`, inline: true },
            { name: 'RGB', value: this.hexToRgb(color), inline: true },
            { name: 'HSL', value: this.hexToHsl(color), inline: true }
        ]);

        await interaction.reply({ embeds: [embed] });
    }

    hexToRgb(hex) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }

    hexToHsl(hex) {
        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('color')
                    .setDescription('Hex color code (e.g., #FF69B4)')
                    .setRequired(true))
            .toJSON();
    }
}

export default new ColorCommand();