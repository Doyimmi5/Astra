import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import { TimeUtils } from '../../../helpers/timeUtils.js';

class RemindCommand extends BaseCommand {
    constructor() {
        super({
            name: 'remind',
            description: 'Set a cute reminder',
            category: 'utility',
            cooldown: 3000
        });
    }

    async execute(interaction, client) {
        const time = interaction.options.getString('time');
        const message = interaction.options.getString('message');

        const timeMs = TimeUtils.parseTime(time);
        if (!timeMs || timeMs < 60000 || timeMs > 31536000000) { // 1 min to 1 year
            return interaction.reply({
                embeds: [CuteEmbedBuilder.error('Invalid Time', 'Time must be between 1 minute and 1 year!')],
                ephemeral: true
            });
        }

        const remindTime = Date.now() + timeMs;
        
        const confirmEmbed = CuteEmbedBuilder.success(
            '⏰ Reminder Set!',
            `I'll remind you about: **${message}**\n\nTime: <t:${Math.floor(remindTime / 1000)}:R>`
        );

        await interaction.reply({ embeds: [confirmEmbed] });

        // Set reminder
        setTimeout(async () => {
            try {
                const reminderEmbed = CuteEmbedBuilder.info(
                    '🔔 Reminder!',
                    `Hey ${interaction.user}! You asked me to remind you:\n\n**${message}**`
                );

                await interaction.followUp({ embeds: [reminderEmbed] });
            } catch (error) {
                client.log(`Failed to send reminder: ${error.message}`, 'error');
            }
        }, timeMs);

        client.log(`Reminder set for ${interaction.user.tag}: ${message} in ${TimeUtils.formatDuration(timeMs)}`, 'info');
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('time')
                    .setDescription('When to remind (e.g., 10m, 1h, 2d)')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('message')
                    .setDescription('What to remind you about')
                    .setRequired(true)
                    .setMaxLength(500))
            .toJSON();
    }
}

export default new RemindCommand();