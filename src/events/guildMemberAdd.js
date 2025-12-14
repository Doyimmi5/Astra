import BaseEvent from '../structures/BaseEvent.js';
import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';

class GuildMemberAddEvent extends BaseEvent {
    constructor() {
        super({
            name: 'guildMemberAdd',
            once: false
        });
    }

    async execute(member, client) {
        const logChannel = member.guild.channels.cache.find(c => c.name === 'member-logs');
        if (!logChannel) return;

        const embed = CuteEmbedBuilder.success(
            '📥 Member Joined',
            `**User:** ${member.user.tag}\n**Account Created:** ${member.user.createdAt.toDateString()}\n**Member Count:** ${member.guild.memberCount}`
        );

        embed.setThumbnail(member.user.displayAvatarURL());
        await logChannel.send({ embeds: [embed] });

        // Auto-role
        const autoRole = member.guild.roles.cache.find(r => r.name === 'Member');
        if (autoRole) {
            await member.roles.add(autoRole);
        }
    }
}

export default new GuildMemberAddEvent();