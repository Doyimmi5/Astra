import BaseEvent from '../structures/BaseEvent.js';
import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';

class MessageDeleteEvent extends BaseEvent {
    constructor() {
        super({
            name: 'messageDelete',
            once: false
        });
    }

    async execute(message, client) {
        if (message.author?.bot) return;
        if (!message.guild) return;

        const logChannel = message.guild.channels.cache.find(c => c.name === 'message-logs');
        if (!logChannel) return;

        const embed = CuteEmbedBuilder.info(
            '🗑️ Message Deleted',
            `**Author:** ${message.author?.tag || 'Unknown'}\n**Channel:** ${message.channel}\n**Content:** ${message.content || 'No content'}`
        );

        await logChannel.send({ embeds: [embed] });
    }
}

export default new MessageDeleteEvent();