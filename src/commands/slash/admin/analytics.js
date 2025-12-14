import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';

class AnalyticsCommand extends BaseCommand {
    constructor() {
        super({
            name: 'analytics',
            description: 'View server analytics and statistics',
            category: 'admin',
            permissions: [PermissionFlagsBits.ManageGuild],
            cooldown: 10000
        });
    }

    async execute(interaction, client) {
        const guild = interaction.guild;
        
        const embed = CuteEmbedBuilder.info(
            '📊 Server Analytics',
            `Analytics for **${guild.name}**`
        );

        embed.addFields([
            { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
            { name: '📝 Channels', value: `${guild.channels.cache.size}`, inline: true },
            { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
            { name: '📅 Created', value: guild.createdAt.toDateString(), inline: true },
            { name: '🔒 Verification', value: guild.verificationLevel.toString(), inline: true },
            { name: '🌟 Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true }
        ]);

        await interaction.reply({ embeds: [embed] });
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
            .toJSON();
    }
}

export default new AnalyticsCommand();