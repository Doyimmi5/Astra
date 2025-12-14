import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';

export default {
    customId: 'maintenance_toggle',
    type: 'button',
    
    async execute(interaction, client) {
        const isCurrentlyEnabled = client.maintenanceMode || false;
        
        if (isCurrentlyEnabled) {
            // Disable maintenance
            client.maintenanceMode = false;
            client.maintenanceReason = null;
            client.maintenanceStart = null;

            if (client.shard) {
                await client.shard.broadcastEval((c) => {
                    c.maintenanceMode = false;
                    c.maintenanceReason = null;
                    c.maintenanceStart = null;
                });
            }

            client.user.setPresence({
                status: 'online',
                activities: [{ name: 'over cute servers 💖', type: 'WATCHING' }]
            });

            const disableEmbed = CuteEmbedBuilder.success(
                '✅ Maintenance Disabled',
                'Bot is now operational again!'
            );

            await interaction.update({ embeds: [disableEmbed], components: [] });
            
        } else {
            // Enable maintenance
            const reason = 'Quick maintenance via button';
            
            client.maintenanceMode = true;
            client.maintenanceReason = reason;
            client.maintenanceStart = Date.now();

            if (client.shard) {
                await client.shard.broadcastEval((c, { reason, start }) => {
                    c.maintenanceMode = true;
                    c.maintenanceReason = reason;
                    c.maintenanceStart = start;
                }, { context: { reason, start: Date.now() } });
            }

            client.user.setPresence({
                status: 'dnd',
                activities: [{ name: '🔧 Under Maintenance', type: 'WATCHING' }]
            });

            const enableEmbed = CuteEmbedBuilder.warning(
                '🔧 Maintenance Enabled',
                'Bot is now in maintenance mode'
            );

            await interaction.update({ embeds: [enableEmbed], components: [] });
        }

        client.log(`Maintenance mode ${isCurrentlyEnabled ? 'disabled' : 'enabled'} by ${interaction.user.tag}`, 'info');
    }
};