import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../middlewares/permissions.js';
import { CooldownMiddleware } from '../../middlewares/cooldown.js';
import Case from '../../database/schemas/Case.js';

class CaseCommand extends BaseCommand {
    constructor() {
        super({
            name: 'case',
            description: 'Look up a moderation case',
            category: 'moderation',
            permissions: [PermissionFlagsBits.ModerateMembers],
            cooldown: 2000
        });
    }

    async execute(interaction, client) {
        if (!await CooldownMiddleware.checkCooldown(interaction, client, this.name, this.cooldown)) return;
        if (!await PermissionMiddleware.checkPermissions(interaction, this.permissions)) return;

        const caseId = interaction.options.getString('case_id');
        const user = interaction.options.getUser('user');

        try {
            if (caseId) {
                // Look up specific case
                const caseData = await Case.findOne({
                    $or: [
                        { caseId: caseId },
                        { caseId: { $regex: `^${caseId}`, $options: 'i' } }
                    ],
                    guildId: interaction.guild.id
                });

                if (!caseData) {
                    return await interaction.reply({
                        embeds: [CuteEmbedBuilder.error('Case Not Found', 'No case found with that ID!')],
                        ephemeral: true
                    });
                }

                const caseEmbed = CuteEmbedBuilder.caseEmbed(caseData);
                await interaction.reply({ embeds: [caseEmbed] });

            } else if (user) {
                // Look up cases for user
                const cases = await Case.find({
                    userId: user.id,
                    guildId: interaction.guild.id
                }).sort({ createdAt: -1 }).limit(10);

                if (cases.length === 0) {
                    return await interaction.reply({
                        embeds: [CuteEmbedBuilder.info('No Cases Found', `${user.tag} has no moderation cases.`)],
                        ephemeral: true
                    });
                }

                const embed = CuteEmbedBuilder.info(
                    `Cases for ${user.tag}`,
                    `Found ${cases.length} case(s) (showing last 10)`
                );

                embed.setThumbnail(user.displayAvatarURL());

                cases.forEach((caseData, index) => {
                    const caseInfo = `**Type:** ${caseData.type}\n**Reason:** ${caseData.reason}\n**Date:** <t:${Math.floor(new Date(caseData.createdAt).getTime() / 1000)}:R>\n**Active:** ${caseData.active ? 'Yes' : 'No'}`;
                    
                    embed.addFields({
                        name: `Case #${caseData.caseId.slice(0, 8)}`,
                        value: caseInfo,
                        inline: true
                    });
                });

                await interaction.reply({ embeds: [embed] });

            } else {
                // Show recent cases
                const recentCases = await Case.find({
                    guildId: interaction.guild.id
                }).sort({ createdAt: -1 }).limit(5);

                if (recentCases.length === 0) {
                    return await interaction.reply({
                        embeds: [CuteEmbedBuilder.info('No Cases', 'No moderation cases found for this server.')],
                        ephemeral: true
                    });
                }

                const embed = CuteEmbedBuilder.info(
                    'Recent Moderation Cases',
                    `Showing the last ${recentCases.length} cases`
                );

                recentCases.forEach(caseData => {
                    const caseInfo = `**User:** <@${caseData.userId}>\n**Type:** ${caseData.type}\n**Reason:** ${caseData.reason}\n**Moderator:** <@${caseData.moderatorId}>`;
                    
                    embed.addFields({
                        name: `Case #${caseData.caseId.slice(0, 8)}`,
                        value: caseInfo,
                        inline: true
                    });
                });

                await interaction.reply({ embeds: [embed] });
            }

        } catch (error) {
            client.log(`Failed to lookup case: ${error.message}`, 'error');
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Lookup Failed', 'Failed to lookup case information!')],
                ephemeral: true
            });
        }
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('case_id')
                    .setDescription('Case ID to look up'))
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('User to look up cases for'))
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
            .toJSON();
    }
}

export default new CaseCommand();