import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import crypto from 'crypto';

class PasswordCommand extends BaseCommand {
    constructor() {
        super({
            name: 'password',
            description: 'Generate a secure password',
            category: 'utility',
            cooldown: 3000
        });
    }

    async execute(interaction, client) {
        const length = interaction.options.getInteger('length') || 12;
        const includeSymbols = interaction.options.getBoolean('symbols') ?? true;
        
        const password = this.generatePassword(length, includeSymbols);
        
        const embed = CuteEmbedBuilder.success(
            '🔐 Password Generated',
            `**Length:** ${length} characters\n**Symbols:** ${includeSymbols ? 'Yes' : 'No'}`
        );
        
        embed.addFields({ name: 'Password', value: `\`${password}\``, inline: false });
        embed.setFooter({ text: 'Keep this password safe! 💖' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    generatePassword(length, includeSymbols) {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        let charset = lowercase + uppercase + numbers;
        if (includeSymbols) charset += symbols;
        
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(crypto.randomInt(0, charset.length));
        }
        
        return password;
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addIntegerOption(option =>
                option.setName('length')
                    .setDescription('Password length (8-50)')
                    .setMinValue(8)
                    .setMaxValue(50))
            .addBooleanOption(option =>
                option.setName('symbols')
                    .setDescription('Include symbols'))
            .toJSON();
    }
}

export default new PasswordCommand();