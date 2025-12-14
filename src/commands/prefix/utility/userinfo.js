import PrefixCommand from '../../../structures/PrefixCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import { PermissionChecker } from '../../../helpers/permissionChecker.js';

class UserinfoCommand extends PrefixCommand {
    constructor() {
        super({
            name: 'userinfo',
            description: 'Show detailed user information',
            usage: 'userinfo [user]',
            aliases: ['ui', 'user', 'whois'],
            category: 'utility'
        });
    }

    async execute(message, args, client) {
        let user = message.author;
        let member = message.guild.members.cache.get(user.id);
        
        if (args[0]) {
            try {
                const userId = args[0].replace(/[<@!>]/g, '');
                user = await client.users.fetch(userId);
                member = message.guild.members.cache.get(user.id);
            } catch {
                return message.reply({ embeds: [CuteEmbedBuilder.error('Invalid User', 'Could not find that user!')] });
            }
        }

        const userLevel = PermissionChecker.getUserLevel(user, message.guild);
        
        const userinfoEmbed = CuteEmbedBuilder.info(
            `${user.tag}'s Information`,
            `Detailed information about ${user.id === message.author.id ? 'you' : 'this user'} 💖`
        );

        userinfoEmbed.setThumbnail(user.displayAvatarURL({ dynamic: true }));

        const userFields = [
            { name: '👤 Username', value: user.tag, inline: true },
            { name: '🆔 User ID', value: user.id, inline: true },
            { name: '🤖 Bot', value: user.bot ? 'Yes' : 'No', inline: true },
            { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
            { name: '⏰ Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
        ];

        if (member) {
            userFields.push(
                { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
                { name: '⏰ Joined', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '🎭 Roles', value: member.roles.cache.size > 1 ? member.roles.cache.filter(r => r.id !== message.guild.id).map(r => r.toString()).slice(0, 10).join(', ') : 'None', inline: false },
                { name: '👑 Permission Level', value: `${userLevel.role} (${userLevel.level})`, inline: true },
                { name: '🎨 Color', value: member.displayHexColor || '#000000', inline: true }
            );

            if (member.premiumSince) {
                userFields.push({ name: '💎 Boosting Since', value: `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>`, inline: true });
            }
        }

        userinfoEmbed.addFields(userFields);

        await message.reply({ embeds: [userinfoEmbed] });
    }
}

export default new UserinfoCommand();