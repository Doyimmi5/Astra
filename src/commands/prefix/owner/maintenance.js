import PrefixCommand from '../../../structures/PrefixCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

class MaintenanceCommand extends PrefixCommand {
    constructor() {
        super({
            name: 'maintenance',
            description: 'Toggle maintenance mode',
            usage: 'maintenance [on|off|status]',
            aliases: ['maint', 'maintain'],
            category: 'owner',
            requiredLevel: 9,
            ownerOnly: true
        });
    }

    async execute(message, args, client) {
        const action = args[0]?.toLowerCase();
        
        if (!action || action === 'status') {
            return this.showStatus(message, client);
        }

        if (action === 'on') {
            return this.enableMaintenance(message, client);
        }

        if (action === 'off') {
            return this.disableMaintenance(message, client);
        }

        await message.reply({ embeds: [CuteEmbedBuilder.error('Invalid Action', 'Use: `maintenance [on|off|status]`')] });
    }

    async showStatus(message, client) {
        const isMaintenanceMode = client.maintenanceMode || false;
        const maintenanceReason = client.maintenanceReason || 'No reason specified';
        const maintenanceStart = client.maintenanceStart || Date.now();

        const statusEmbed = CuteEmbedBuilder.info(
            '🔧 Maintenance Status',
            `Current maintenance mode status`
        );

        statusEmbed.addFields([
            { name: 'Status', value: isMaintenanceMode ? '🔴 Enabled' : '🟢 Disabled', inline: true },
            { name: 'Reason', value: maintenanceReason, inline: true },
            { name: 'Duration', value: isMaintenanceMode ? `<t:${Math.floor(maintenanceStart / 1000)}:R>` : 'N/A', inline: true }
        ]);

        if (isMaintenanceMode) {
            statusEmbed.addFields({
                name: '⚠️ Active Restrictions',
                value: '• All commands disabled for non-owners\n• Slash commands return maintenance message\n• Auto-moderation paused\n• Event processing limited',
                inline: false
            });
        }

        const toggleRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('maintenance_toggle')
                    .setLabel(isMaintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance')
                    .setStyle(isMaintenanceMode ? ButtonStyle.Success : ButtonStyle.Danger)
                    .setEmoji(isMaintenanceMode ? '🟢' : '🔴')
            );

        await message.reply({ embeds: [statusEmbed], components: [toggleRow] });
    }

    async enableMaintenance(message, client) {
        const reason = message.content.split(' ').slice(2).join(' ') || 'Scheduled maintenance';
        
        client.maintenanceMode = true;
        client.maintenanceReason = reason;
        client.maintenanceStart = Date.now();

        // Broadcast to all shards if sharded
        if (client.shard) {
            await client.shard.broadcastEval((c, { reason, start }) => {
                c.maintenanceMode = true;
                c.maintenanceReason = reason;
                c.maintenanceStart = start;
            }, { context: { reason, start: Date.now() } });
        }

        const maintenanceEmbed = CuteEmbedBuilder.warning(
            '🔧 Maintenance Mode Enabled',
            'Bot is now in maintenance mode'
        );

        maintenanceEmbed.addFields([
            { name: 'Reason', value: reason, inline: true },
            { name: 'Started', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
            { name: 'Enabled By', value: message.author.tag, inline: true }
        ]);

        // Update bot status
        client.user.setPresence({
            status: 'dnd',
            activities: [{ name: '🔧 Under Maintenance', type: 'WATCHING' }]
        });

        await message.reply({ embeds: [maintenanceEmbed] });
        client.log(`Maintenance mode enabled by ${message.author.tag}: ${reason}`, 'warn');
    }

    async disableMaintenance(message, client) {
        if (!client.maintenanceMode) {
            return message.reply({ embeds: [CuteEmbedBuilder.error('Not in Maintenance', 'Bot is not currently in maintenance mode!')] });
        }

        const duration = Date.now() - (client.maintenanceStart || Date.now());
        
        client.maintenanceMode = false;
        client.maintenanceReason = null;
        client.maintenanceStart = null;

        // Broadcast to all shards if sharded
        if (client.shard) {
            await client.shard.broadcastEval((c) => {
                c.maintenanceMode = false;
                c.maintenanceReason = null;
                c.maintenanceStart = null;
            });
        }

        const maintenanceEmbed = CuteEmbedBuilder.success(
            '✅ Maintenance Mode Disabled',
            'Bot is now operational again!'
        );

        maintenanceEmbed.addFields([
            { name: 'Duration', value: `${Math.round(duration / 1000 / 60)} minutes`, inline: true },
            { name: 'Ended', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
            { name: 'Disabled By', value: message.author.tag, inline: true }
        ]);

        // Reset bot status
        client.user.setPresence({
            status: 'online',
            activities: [{ name: 'over cute servers 💖', type: 'WATCHING' }]
        });

        await message.reply({ embeds: [maintenanceEmbed] });
        client.log(`Maintenance mode disabled by ${message.author.tag}`, 'info');
    }
}

export default new MaintenanceCommand();