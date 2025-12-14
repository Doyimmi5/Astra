import PrefixCommand from '../../../structures/PrefixCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

class RestartCommand extends PrefixCommand {
    constructor() {
        super({
            name: 'restart',
            description: 'Restart the bot',
            usage: 'restart [--force]',
            aliases: ['reboot', 'reload-bot'],
            category: 'owner',
            requiredLevel: 9,
            ownerOnly: true
        });
    }

    async execute(message, args, client) {
        const force = args.includes('--force');

        if (!force) {
            const confirmRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('restart_confirm')
                        .setLabel('Confirm Restart')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔄'),
                    new ButtonBuilder()
                        .setCustomId('restart_cancel')
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('❌')
                );

            const confirmEmbed = CuteEmbedBuilder.warning(
                '🔄 Confirm Restart',
                'Are you sure you want to restart the bot?\n\n⚠️ This will disconnect all voice connections and interrupt ongoing processes.'
            );

            return message.reply({ embeds: [confirmEmbed], components: [confirmRow] });
        }

        await this.performRestart(message, client);
    }

    static async performRestart(message, client) {
        const restartEmbed = CuteEmbedBuilder.info(
            '🔄 Restarting Bot',
            'Bot is restarting... I\'ll be back soon! 💖'
        );

        restartEmbed.addFields([
            { name: 'Initiated By', value: message.author.tag, inline: true },
            { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
            { name: 'Expected Downtime', value: '~10-30 seconds', inline: true }
        ]);

        await message.reply({ embeds: [restartEmbed] });

        client.log(`Bot restart initiated by ${message.author.tag}`, 'warn');

        // Graceful shutdown
        setTimeout(() => {
            process.exit(0);
        }, 2000);
    }
}

export default new RestartCommand();