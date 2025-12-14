import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../middlewares/permissions.js';
import { CooldownMiddleware } from '../../middlewares/cooldown.js';
import { TimeUtils } from '../../helpers/timeUtils.js';
import { Validators } from '../../helpers/validators.js';
import Case from '../../database/schemas/Case.js';
import ms from 'ms';

class MuteCommand extends BaseCommand {
    constructor() {
        super({
            name: 'mute',
            description: 'Timeout a user in the server',
            category: 'moderation',
            permissions: [PermissionFlagsBits.ModerateMembers],
            botPermissions: [PermissionFlagsBits.ModerateMembers],
            cooldown: 3000
        });
    }

    async execute(interaction, client) {
        if (!await CooldownMiddleware.checkCooldown(interaction, client, this.name, this.cooldown)) return;
        if (!await PermissionMiddleware.checkPermissions(interaction, this.permissions)) return;
        if (!await PermissionMiddleware.checkBotPermissions(interaction, this.botPermissions)) return;

        const user = interaction.options.getUser('user');
        const duration = interaction.options.getString('duration') || '10m';
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!await PermissionMiddleware.checkSelfModeration(interaction, user)) return;

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('User Not Found', 'This user is not in the server!')],
                ephemeral: true
            });
        }

        if (!await PermissionMiddleware.checkHierarchy(interaction, member)) return;

        if (!Validators.isValidReason(reason)) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Invalid Reason', 'Reason must be 512 characters or less!')],
                ephemeral: true
            });
        }

        const timeMs = TimeUtils.parseTime(duration);
        if (!timeMs || timeMs < 1000 || timeMs > 2419200000) { // Max 28 days
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Invalid Duration', 'Duration must be between 1 second and 28 days!')],
                ephemeral: true
            });
        }

        if (member.isCommunicationDisabled()) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Already Muted', 'This user is already timed out!')],
                ephemeral: true
            });
        }

        try {
            // Send DM to user before muting
            try {
                const dmEmbed = CuteEmbedBuilder.warning(
                    'You have been muted',
                    `You were timed out in **${interaction.guild.name}**\n\n**Duration:** ${TimeUtils.formatDuration(timeMs)}\n**Reason:** ${reason}`
                );
                await user.send({ embeds: [dmEmbed] });
            } catch (error) {
                // User has DMs disabled
            }

            await member.timeout(timeMs, reason);

            // Create case in database
            const newCase = new Case({
                guildId: interaction.guild.id,
                userId: user.id,
                moderatorId: interaction.user.id,
                type: 'mute',
                reason: reason,
                duration: timeMs,
                expiresAt: new Date(Date.now() + timeMs)
            });
            await newCase.save();

            const successEmbed = CuteEmbedBuilder.moderation('mute', user, interaction.user, reason, TimeUtils.formatDuration(timeMs));
            successEmbed.addFields(
                { name: 'Case ID', value: newCase.caseId.slice(0, 8), inline: true },
                { name: 'Expires', value: `<t:${Math.floor((Date.now() + timeMs) / 1000)}:R>`, inline: true }
            );

            await interaction.reply({ embeds: [successEmbed] });

            client.log(`${interaction.user.tag} muted ${user.tag} for ${TimeUtils.formatDuration(timeMs)}: ${reason}`, 'info');

        } catch (error) {
            client.log(`Failed to mute ${user.tag}: ${error.message}`, 'error');
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Mute Failed', `Failed to mute ${user.tag}: ${error.message}`)],
                ephemeral: true
            });
        }
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to mute')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('duration')
                    .setDescription('Duration of the mute (e.g., 10m, 1h, 1d)')
                    .setRequired(false))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for the mute')
                    .setMaxLength(512))
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
            .toJSON();
    }
}

export default new MuteCommand();