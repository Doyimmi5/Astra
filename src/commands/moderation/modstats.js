import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../middlewares/permissions.js';
import { CooldownMiddleware } from '../../middlewares/cooldown.js';
import Case from '../../database/schemas/Case.js';
import User from '../../database/schemas/User.js';

class ModstatsCommand extends BaseCommand {
    constructor() {
        super({
            name: 'modstats',
            description: 'View moderation statistics',
            category: 'moderation',
            permissions: [PermissionFlagsBits.ModerateMembers],
            cooldown: 5000
        });
    }

    async execute(interaction, client) {
        if (!await CooldownMiddleware.checkCooldown(interaction, client, this.name, this.cooldown)) return;
        if (!await PermissionMiddleware.checkPermissions(interaction, this.permissions)) return;

        const moderator = interaction.options.getUser('moderator');

        try {
            await interaction.deferReply();

            if (moderator) {
                // Show stats for specific moderator
                const modCases = await Case.find({
                    guildId: interaction.guild.id,
                    moderatorId: moderator.id
                });

                if (modCases.length === 0) {
                    return await interaction.editReply({
                        embeds: [CuteEmbedBuilder.info('No Actions', `${moderator.tag} has no moderation actions.`)]
                    });
                }

                const actionCounts = {};
                modCases.forEach(c => {
                    actionCounts[c.type] = (actionCounts[c.type] || 0) + 1;
                });

                const statsEmbed = CuteEmbedBuilder.info(
                    `Moderation Stats - ${moderator.tag}`,
                    `Total actions: **${modCases.length}**`
                );

                statsEmbed.setThumbnail(moderator.displayAvatarURL());

                const actionsList = Object.entries(actionCounts)
                    .map(([type, count]) => `**${type.charAt(0).toUpperCase() + type.slice(1)}:** ${count}`)
                    .join('\n');

                statsEmbed.addFields([
                    { name: 'Actions Breakdown', value: actionsList, inline: false },
                    { name: 'First Action', value: `<t:${Math.floor(new Date(modCases[modCases.length - 1].createdAt).getTime() / 1000)}:R>`, inline: true },
                    { name: 'Latest Action', value: `<t:${Math.floor(new Date(modCases[0].createdAt).getTime() / 1000)}:R>`, inline: true }
                ]);

                await interaction.editReply({ embeds: [statsEmbed] });

            } else {
                // Show server-wide stats
                const [totalCases, totalUsers, activeCases] = await Promise.all([
                    Case.countDocuments({ guildId: interaction.guild.id }),
                    User.countDocuments({ 'warnings.guildId': interaction.guild.id }),
                    Case.countDocuments({ guildId: interaction.guild.id, active: true })
                ]);

                const recentCases = await Case.find({
                    guildId: interaction.guild.id
                }).sort({ createdAt: -1 }).limit(100);

                const actionCounts = {};
                const moderatorCounts = {};

                recentCases.forEach(c => {
                    actionCounts[c.type] = (actionCounts[c.type] || 0) + 1;
                    moderatorCounts[c.moderatorId] = (moderatorCounts[c.moderatorId] || 0) + 1;
                });

                const topModerators = Object.entries(moderatorCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([id, count]) => `<@${id}>: ${count}`)
                    .join('\n') || 'None';

                const actionsList = Object.entries(actionCounts)
                    .map(([type, count]) => `**${type.charAt(0).toUpperCase() + type.slice(1)}:** ${count}`)
                    .join('\n') || 'None';

                const statsEmbed = CuteEmbedBuilder.info(
                    `${interaction.guild.name} Moderation Stats`,
                    'Server-wide moderation statistics'
                );

                statsEmbed.setThumbnail(interaction.guild.iconURL());

                statsEmbed.addFields([
                    { name: 'Total Cases', value: totalCases.toString(), inline: true },
                    { name: 'Active Cases', value: activeCases.toString(), inline: true },
                    { name: 'Users with Warnings', value: totalUsers.toString(), inline: true },
                    { name: 'Recent Actions (Last 100)', value: actionsList, inline: false },
                    { name: 'Top Moderators (Recent)', value: topModerators, inline: false }
                ]);

                await interaction.editReply({ embeds: [statsEmbed] });
            }

        } catch (error) {
            client.log(`Failed to get moderation stats: ${error.message}`, 'error');
            await interaction.editReply({
                embeds: [CuteEmbedBuilder.error('Stats Error', 'Failed to retrieve moderation statistics!')]
            });
        }
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option =>
                option.setName('moderator')
                    .setDescription('View stats for specific moderator'))
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
            .toJSON();
    }
}

export default new ModstatsCommand();