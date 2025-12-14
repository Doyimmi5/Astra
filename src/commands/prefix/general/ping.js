import PrefixCommand from '../../../structures/PrefixCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import { TimeUtils } from '../../../helpers/timeUtils.js';

class PingCommand extends PrefixCommand {
    constructor() {
        super({
            name: 'ping',
            description: 'Check bot latency and response time',
            usage: 'ping',
            aliases: ['pong', 'latency'],
            category: 'general'
        });
    }

    async execute(message, args, client) {
        const start = Date.now();
        const msg = await message.reply('🌸 Pinging...');
        const end = Date.now();

        const apiLatency = Math.round(client.ws.ping);
        const botLatency = end - start;
        
        let latencyColor = '#98FB98'; // Green
        if (apiLatency > 200 || botLatency > 200) latencyColor = '#FFD700'; // Yellow
        if (apiLatency > 500 || botLatency > 500) latencyColor = '#FF6B6B'; // Red

        const pingEmbed = new CuteEmbedBuilder.success('🏓 Pong!', 'Bot latency information')
            .setColor(latencyColor)
            .addFields([
                { name: '🤖 Bot Latency', value: `${botLatency}ms`, inline: true },
                { name: '📡 API Latency', value: `${apiLatency}ms`, inline: true },
                { name: '⏱️ Uptime', value: TimeUtils.formatDuration(client.uptime), inline: true }
            ])
            .setFooter({ text: `Shard ${client.shard?.ids[0] || 0} | Made with 💖` });

        await msg.edit({ content: null, embeds: [pingEmbed] });
    }
}

export default new PingCommand();