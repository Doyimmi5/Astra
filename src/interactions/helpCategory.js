import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';
import { PermissionChecker } from '../helpers/permissionChecker.js';

export default {
    customId: 'help_category',
    type: 'selectmenu',
    
    async execute(interaction, client) {
        const category = interaction.values[0];
        const userLevel = PermissionChecker.getUserLevel(interaction.user, interaction.guild);
        
        const categoryCommands = {
            general: [
                '`ping` - Check bot latency',
                '`help` - Show this help menu',
                '`uptime` - Bot uptime info',
                '`stats` - Bot statistics',
                '`avatar` - Show user avatar',
                '`userinfo` - User information',
                '`serverinfo` - Server information'
            ],
            moderation: [
                '`ban` - Ban a user',
                '`kick` - Kick a user',
                '`mute` - Timeout a user',
                '`unmute` - Remove timeout',
                '`warn` - Warn a user',
                '`clear` - Delete messages',
                '`lockdown` - Lock channel',
                '`slowmode` - Set slowmode',
                '`case` - View mod cases'
            ],
            utility: [
                '`avatar` - User avatars',
                '`userinfo` - User details',
                '`serverinfo` - Server details',
                '`roleinfo` - Role information',
                '`channelinfo` - Channel info',
                '`emojis` - Server emojis',
                '`invites` - Server invites'
            ],
            admin: [
                '`automod` - Configure automod',
                '`settings` - Server settings',
                '`backup` - Server backup',
                '`restore` - Restore backup',
                '`massban` - Mass ban users',
                '`lockserver` - Emergency lock'
            ],
            owner: [
                '`eval` - Execute code',
                '`restart` - Restart bot',
                '`maintenance` - Maintenance mode',
                '`reload` - Reload commands',
                '`blacklist` - User blacklist',
                '`whitelist` - Server whitelist'
            ]
        };

        const requiredLevels = {
            general: 0,
            moderation: 5,
            utility: 0,
            admin: 8,
            owner: 10
        };

        if (userLevel.level < requiredLevels[category]) {
            return interaction.reply({
                embeds: [CuteEmbedBuilder.error(
                    'Access Denied',
                    `You need level ${requiredLevels[category]} or higher to view ${category} commands!`
                )],
                ephemeral: true
            });
        }

        const categoryEmojis = {
            general: '🌸',
            moderation: '🔨',
            utility: '⚙️',
            admin: '👑',
            owner: '🔧'
        };

        const helpEmbed = CuteEmbedBuilder.info(
            `${categoryEmojis[category]} ${category.charAt(0).toUpperCase() + category.slice(1)} Commands`,
            `Available ${category} commands for your level (${userLevel.level})`
        );

        const commands = categoryCommands[category] || ['No commands available'];
        helpEmbed.addFields({
            name: 'Commands',
            value: commands.join('\n'),
            inline: false
        });

        helpEmbed.addFields({
            name: 'Usage',
            value: 'Use `!command` for prefix or `/command` for slash commands',
            inline: false
        });

        await interaction.update({ embeds: [helpEmbed] });
    }
};