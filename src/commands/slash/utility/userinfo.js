import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import { PermissionChecker } from '../../../helpers/permissionChecker.js';

class UserinfoSlashCommand extends BaseCommand {
    constructor() {
        super({
            name: 'userinfo',
            description: 'Show detailed user information',
            category: 'utility',
            cooldown: 3000
        });
    }

    async execute(interaction, client) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);
        
        const userLevel = PermissionChecker.getUserLevel(user, interaction.guild);
        
        const userinfoEmbed = CuteEmbedBuilder.info(
            `${user.tag}'s Information`,
            `Detailed information about ${user.id === interaction.user.id ? 'you' : 'this user'} 💖`
        );

        userinfoEmbed.setThumbnail(user.displayAvatarURL({ dynamic: true }));

        const userFields = [
            { name: '👤 Username', value: user.tag, inline: true },
            { name: '🆔 User ID', value: user.id, inline: true },
            { name: '🤖 Bot', value: user.bot ? 'Yes' : 'No', inline: true },
            { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false }
        ];

        if (member) {
            userFields.push(
                { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
                { name: '🎭 Roles', value: member.roles.cache.size > 1 ? member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r.toString()).slice(0, 10).join(', ') : 'None', inline: false },
                { name: '👑 Permission Level', value: `${userLevel.role} (${userLevel.level})`, inline: true }
            );
        }

        userinfoEmbed.addFields(userFields);

        await interaction.reply({ embeds: [userinfoEmbed] });
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('User to show information for'))
            .toJSON();
    }
}

export default new UserinfoSlashCommand();