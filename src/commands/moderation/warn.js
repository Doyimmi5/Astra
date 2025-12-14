import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../middlewares/permissions.js';
import { CooldownMiddleware } from '../../middlewares/cooldown.js';
import { Validators } from '../../helpers/validators.js';
import Case from '../../database/schemas/Case.js';
import User from '../../database/schemas/User.js';

class WarnCommand extends BaseCommand {
    constructor() {
        super({
            name: 'warn',
            description: 'Warn a user',
            category: 'moderation',
            permissions: [PermissionFlagsBits.ModerateMembers],
            cooldown: 2000
        });
    }

    async execute(interaction, client) {
        if (!await CooldownMiddleware.checkCooldown(interaction, client, this.name, this.cooldown)) return;
        if (!await PermissionMiddleware.checkPermissions(interaction, this.permissions)) return;

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!await PermissionMiddleware.checkSelfModeration(interaction, user)) return;

        const member = interaction.guild.members.cache.get(user.id);
        if (member && !await PermissionMiddleware.checkHierarchy(interaction, member)) return;

        if (!Validators.isValidReason(reason)) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Invalid Reason', 'Reason must be 512 characters or less!')],
                ephemeral: true
            });
        }

        try {
            // Find or create user document
            let userDoc = await User.findOne({ userId: user.id });
            if (!userDoc) {
                userDoc = new User({ userId: user.id });
            }

            // Add warning
            userDoc.warnings.push({
                guildId: interaction.guild.id,
                reason: reason,
                moderatorId: interaction.user.id,
                date: new Date()
            });
            userDoc.infractions += 1;
            await userDoc.save();

            // Create case in database
            const newCase = new Case({
                guildId: interaction.guild.id,
                userId: user.id,
                moderatorId: interaction.user.id,
                type: 'warn',
                reason: reason
            });
            await newCase.save();

            // Send DM to user
            try {
                const dmEmbed = CuteEmbedBuilder.warning(
                    'You have been warned',
                    `You received a warning in **${interaction.guild.name}**\n\n**Reason:** ${reason}\n**Total Warnings:** ${userDoc.warnings.filter(w => w.guildId === interaction.guild.id && w.active).length}`
                );
                await user.send({ embeds: [dmEmbed] });
            } catch (error) {
                // User has DMs disabled
            }

            const guildWarnings = userDoc.warnings.filter(w => w.guildId === interaction.guild.id && w.active).length;
            const successEmbed = CuteEmbedBuilder.moderation('warn', user, interaction.user, reason);
            successEmbed.addFields(
                { name: 'Case ID', value: newCase.caseId.slice(0, 8), inline: true },
                { name: 'Total Warnings', value: guildWarnings.toString(), inline: true }
            );

            if (guildWarnings >= 3) {
                successEmbed.addFields({ 
                    name: '⚠️ Warning Threshold Reached', 
                    value: 'This user has reached the warning threshold and may need further action!', 
                    inline: false 
                });
            }

            await interaction.reply({ embeds: [successEmbed] });

            client.log(`${interaction.user.tag} warned ${user.tag}: ${reason}`, 'info');

        } catch (error) {
            client.log(`Failed to warn ${user.tag}: ${error.message}`, 'error');
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Warning Failed', `Failed to warn ${user.tag}: ${error.message}`)],
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
                    .setDescription('The user to warn')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for the warning')
                    .setRequired(true)
                    .setMaxLength(512))
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
            .toJSON();
    }
}

export default new WarnCommand();