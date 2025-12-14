import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import { TimeUtils } from '../../../helpers/timeUtils.js';

class PingSlashCommand extends BaseCommand {
    constructor() {
        super({
            name: 'ping',
            description: 'Check bot latency and response time',
            category: 'general',
            cooldown: 2000
        });
    }

    async execute(interaction, client) {
        const start = Date.now();
        
        // Initial response
        const initialEmbed = CuteEmbedBuilder.info('🏓 Pinging...', 'Calculating latency... 💖');
        await interaction.reply({ embeds: [initialEmbed] });
        
        const end = Date.now();
        const botLatency = end - start;
        const apiLatency = Math.round(client.ws.ping);
        const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const totalMemory = Math.round(process.memoryUsage().rss / 1024 / 1024);
        const cpuUsage = process.cpuUsage();
        
        // Connection quality
        let quality, qualityEmoji, color;
        if (apiLatency < 100) {
            quality = 'Excellent'; qualityEmoji = '🟢'; color = '#00FF00';
        } else if (apiLatency < 200) {
            quality = 'Good'; qualityEmoji = '🟡'; color = '#FFFF00';
        } else if (apiLatency < 500) {
            quality = 'Fair'; qualityEmoji = '🟠'; color = '#FFA500';
        } else {
            quality = 'Poor'; qualityEmoji = '🔴'; color = '#FF0000';
        }
        
        // System info
        const osInfo = `${process.platform} ${process.arch}`;
        const nodeVersion = process.version;
        
        const embed = CuteEmbedBuilder.success(
            '🏓 Pong! Performance Dashboard',
            `${qualityEmoji} **Connection Quality:** ${quality}`
        )
        .setColor(color)
        .addFields([
            { name: '⚡ Response Time', value: `\`${botLatency}ms\``, inline: true },
            { name: '📡 API Latency', value: `\`${apiLatency}ms\``, inline: true },
            { name: '🌐 WebSocket', value: client.ws.ping === -1 ? '`Connecting...`' : `\`${client.ws.ping}ms\``, inline: true },
            { name: '💾 Memory (Heap)', value: `\`${memoryUsage}MB\``, inline: true },
            { name: '🗄️ Memory (Total)', value: `\`${totalMemory}MB\``, inline: true },
            { name: '⏱️ Uptime', value: `\`${TimeUtils.formatDuration(client.uptime)}\``, inline: true },
            { name: '🏠 Servers', value: `\`${client.guilds.cache.size}\``, inline: true },
            { name: '👥 Users', value: `\`${client.users.cache.size}\``, inline: true },
            { name: '📝 Commands', value: `\`${client.commands.size}\``, inline: true },
            { name: '🖥️ System', value: `\`${osInfo}\``, inline: true },
            { name: '🟢 Node.js', value: `\`${nodeVersion}\``, inline: true },
            { name: '🤖 Process ID', value: `\`${process.pid}\``, inline: true }
        ])
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Shard ${client.shard?.ids[0] || 0} • Made with 💖 by Astra` })
        .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .toJSON();
    }
}

export default new PingSlashCommand();