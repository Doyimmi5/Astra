import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';

class TimestampCommand extends BaseCommand {
    constructor() {
        super({
            name: 'timestamp',
            description: 'Generate Discord timestamps',
            category: 'utility',
            cooldown: 2000
        });
    }

    async execute(interaction, client) {
        const time = interaction.options.getString('time');
        let timestamp;

        if (time === 'now') {
            timestamp = Math.floor(Date.now() / 1000);
        } else {
            const date = new Date(time);
            if (isNaN(date.getTime())) {
                return interaction.reply({
                    embeds: [CuteEmbedBuilder.error('Invalid Date', 'Please provide a valid date!')],
                    ephemeral: true
                });
            }
            timestamp = Math.floor(date.getTime() / 1000);
        }

        const embed = CuteEmbedBuilder.success(
            '⏰ Discord Timestamps',
            'Copy and paste these in Discord! 💖'
        );

        embed.addFields([
            { name: 'Short Time', value: `\`<t:${timestamp}:t>\` → <t:${timestamp}:t>`, inline: false },
            { name: 'Long Time', value: `\`<t:${timestamp}:T>\` → <t:${timestamp}:T>`, inline: false },
            { name: 'Short Date', value: `\`<t:${timestamp}:d>\` → <t:${timestamp}:d>`, inline: false },
            { name: 'Long Date', value: `\`<t:${timestamp}:D>\` → <t:${timestamp}:D>`, inline: false },
            { name: 'Relative', value: `\`<t:${timestamp}:R>\` → <t:${timestamp}:R>`, inline: false }
        ]);

        await interaction.reply({ embeds: [embed] });
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('time')
                    .setDescription('Time (e.g., "now", "2024-12-25", "2024-12-25 15:30")')
                    .setRequired(true))
            .toJSON();
    }
}

export default new TimestampCommand();