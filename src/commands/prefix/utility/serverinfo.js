import PrefixCommand from '../../../structures/PrefixCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';

class ServerinfoCommand extends PrefixCommand {
    constructor() {
        super({
            name: 'serverinfo',
            description: 'Show detailed server information',
            usage: 'serverinfo',
            aliases: ['si', 'server', 'guildinfo'],
            category: 'utility'
        });
    }

    async execute(message, args, client) {
        const guild = message.guild;
        const owner = await guild.fetchOwner();
        
        const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
        const categories = guild.channels.cache.filter(c => c.type === 4).size;
        
        const onlineMembers = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;
        const botCount = guild.members.cache.filter(m => m.user.bot).size;
        const humanCount = guild.memberCount - botCount;

        const serverEmbed = CuteEmbedBuilder.info(
            `${guild.name} Information`,
            `Detailed information about this server 🏠`
        );

        if (guild.iconURL()) {
            serverEmbed.setThumbnail(guild.iconURL({ dynamic: true }));
        }

        serverEmbed.addFields([
            { name: '🏠 Server Name', value: guild.name, inline: true },
            { name: '🆔 Server ID', value: guild.id, inline: true },
            { name: '👑 Owner', value: owner.user.tag, inline: true },
            { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
            { name: '⏰ Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
            { name: '👥 Members', value: `${guild.memberCount} total\n${humanCount} humans\n${botCount} bots`, inline: true },
            { name: '🟢 Online', value: onlineMembers.toString(), inline: true },
            { name: '📺 Channels', value: `${guild.channels.cache.size} total\n${textChannels} text\n${voiceChannels} voice\n${categories} categories`, inline: true },
            { name: '🎭 Roles', value: guild.roles.cache.size.toString(), inline: true },
            { name: '😀 Emojis', value: guild.emojis.cache.size.toString(), inline: true },
            { name: '🔒 Verification', value: guild.verificationLevel.toString(), inline: true },
            { name: '💎 Boost Level', value: `Level ${guild.premiumTier}\n${guild.premiumSubscriptionCount} boosts`, inline: true },
            { name: '🌟 Features', value: guild.features.length > 0 ? guild.features.slice(0, 5).join(', ') : 'None', inline: true }
        ]);

        if (guild.description) {
            serverEmbed.addFields({ name: '📝 Description', value: guild.description, inline: false });
        }

        await message.reply({ embeds: [serverEmbed] });
    }
}

export default new ServerinfoCommand();