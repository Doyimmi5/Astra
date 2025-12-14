import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../middlewares/permissions.js';
import { CooldownMiddleware } from '../../middlewares/cooldown.js';
import { Validators } from '../../helpers/validators.js';
import Case from '../../database/schemas/Case.js';
import msleep from 'msleep';

class MassbanCommand extends BaseCommand {
    constructor() {
        super({
            name: 'massban',
            description: 'Ban multiple users by ID (raid protection)',
            category: 'moderation',
            permissions: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.Administrator],
            botPermissions: [PermissionFlagsBits.BanMembers],
            cooldown: 30000
        });
    }

    async execute(interaction, client) {
        if (!await CooldownMiddleware.checkCooldown(interaction, client, this.name, this.cooldown)) return;
        if (!await PermissionMiddleware.checkPermissions(interaction, this.permissions)) return;
        if (!await PermissionMiddleware.checkBotPermissions(interaction, this.botPermissions)) return;

        const userIds = interaction.options.getString('user_ids').split(/[\s,]+/).filter(id => id.trim());
        const reason = interaction.options.getString('reason') || 'Mass ban - raid protection';

        if (userIds.length > 20) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Too Many Users', 'Maximum 20 users can be banned at once!')],
                ephemeral: true
            });
        }

        const validIds = userIds.filter(id => Validators.isValidUserId(id));
        if (validIds.length === 0) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Invalid IDs', 'No valid user IDs provided!')],
                ephemeral: true
            });
        }

        try {
            await interaction.deferReply();

            let banned = 0;
            let failed = 0;
            const results = [];

            for (const userId of validIds) {
                try {
                    // Check if user is already banned
                    const bans = await interaction.guild.bans.fetch();
                    if (bans.has(userId)) {
                        results.push(`❌ <@${userId}> - Already banned`);
                        failed++;
                        continue;
                    }

                    await interaction.guild.members.ban(userId, {
                        reason: `Mass ban by ${interaction.user.tag}: ${reason}`,
                        deleteMessageDays: 1
                    });

                    // Create case
                    const newCase = new Case({
                        guildId: interaction.guild.id,
                        userId: userId,
                        moderatorId: interaction.user.id,
                        type: 'ban',
                        reason: reason
                    });
                    await newCase.save();

                    results.push(`✅ <@${userId}> - Banned`);
                    banned++;

                    // Rate limit protection
                    await msleep(500);

                } catch (error) {
                    results.push(`❌ <@${userId}> - ${error.message}`);
                    failed++;
                }
            }

            const massbanEmbed = CuteEmbedBuilder.success(
                'Mass Ban Complete',
                `Processed ${validIds.length} users\n**Banned:** ${banned}\n**Failed:** ${failed}`
            );

            massbanEmbed.addFields([
                { name: 'Moderator', value: interaction.user.toString(), inline: true },
                { name: 'Reason', value: reason, inline: true },
                { name: 'Results', value: results.slice(0, 10).join('\n') || 'None', inline: false }
            ]);

            if (results.length > 10) {
                massbanEmbed.setFooter({ text: `Showing 10 of ${results.length} results` });
            }

            await interaction.editReply({ embeds: [massbanEmbed] });

            client.log(`${interaction.user.tag} mass banned ${banned} users: ${reason}`, 'info');

        } catch (error) {
            client.log(`Mass ban failed: ${error.message}`, 'error');
            await interaction.editReply({
                embeds: [CuteEmbedBuilder.error('Mass Ban Failed', `Failed to execute mass ban: ${error.message}`)]
            });
        }
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('user_ids')
                    .setDescription('User IDs separated by spaces or commas (max 20)')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for mass ban')
                    .setMaxLength(512))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .toJSON();
    }
}

export default new MassbanCommand();