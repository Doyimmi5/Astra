import PrefixCommand from '../../../structures/PrefixCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import { TimeUtils } from '../../../helpers/timeUtils.js';
import os from 'os';

class UptimeCommand extends PrefixCommand {
    constructor() {
        super({
            name: 'uptime',
            description: 'Show bot uptime and system information',
            usage: 'uptime',
            aliases: ['up', 'status'],
            category: 'general'
        });
    }

    async execute(message, args, client) {
        const botUptime = TimeUtils.formatDuration(client.uptime);
        const processUptime = TimeUtils.formatDuration(process.uptime() * 1000);
        const systemUptime = TimeUtils.formatDuration(os.uptime() * 1000);
        
        const memUsage = process.memoryUsage();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        const uptimeEmbed = CuteEmbedBuilder.success(
            '⏰ Uptime Information',
            `I've been running smoothly for you! 💖`
        );

        uptimeEmbed.addFields([
            { name: '🤖 Bot Uptime', value: botUptime, inline: true },
            { name: '⚡ Process Uptime', value: processUptime, inline: true },
            { name: '🖥️ System Uptime', value: systemUptime, inline: true },
            { name: '💾 Memory Usage', value: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`, inline: true },
            { name: '🖥️ System Memory', value: `${Math.round(usedMem / 1024 / 1024 / 1024 * 100) / 100}GB / ${Math.round(totalMem / 1024 / 1024 / 1024 * 100) / 100}GB`, inline: true },
            { name: '📊 CPU Usage', value: `${os.loadavg()[0].toFixed(2)}%`, inline: true }
        ]);

        uptimeEmbed.setFooter({ text: `Node.js ${process.version} • ${os.platform()} ${os.arch()}` });

        await message.reply({ embeds: [uptimeEmbed] });
    }
}

export default new UptimeCommand();