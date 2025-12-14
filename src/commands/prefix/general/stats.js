import PrefixCommand from '../../../structures/PrefixCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import { TimeUtils } from '../../../helpers/timeUtils.js';
import os from 'os';

class StatsCommand extends PrefixCommand {
    constructor() {
        super({
            name: 'stats',
            description: 'Show detailed bot statistics',
            usage: 'stats',
            aliases: ['statistics', 'info', 'botinfo'],
            category: 'general'
        });
    }

    async execute(message, args, client) {
        const memUsage = process.memoryUsage();
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const totalChannels = client.channels.cache.size;
        
        const statsEmbed = CuteEmbedBuilder.success(
            '📊 Bot Statistics',
            `Here are my current stats! 💖`
        );

        statsEmbed.addFields([
            { name: '🏠 Servers', value: client.guilds.cache.size.toString(), inline: true },
            { name: '👥 Users', value: totalUsers.toLocaleString(), inline: true },
            { name: '📺 Channels', value: totalChannels.toString(), inline: true },
            { name: '⚡ Commands', value: (client.commands.size + (client.prefixCommands?.size || 0)).toString(), inline: true },
            { name: '🌸 Shard', value: `${client.shard?.ids[0] || 0}/${client.shard?.count || 1}`, inline: true },
            { name: '📡 Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
            { name: '💾 Memory', value: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`, inline: true },
            { name: '⏰ Uptime', value: TimeUtils.formatDuration(client.uptime), inline: true },
            { name: '🖥️ Platform', value: `${os.platform()} ${os.arch()}`, inline: true }
        ]);

        statsEmbed.setFooter({ text: `Node.js ${process.version} • Discord.js v14` });

        await message.reply({ embeds: [statsEmbed] });
    }
}

export default new StatsCommand();