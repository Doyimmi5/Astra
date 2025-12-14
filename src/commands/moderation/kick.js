import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../middlewares/permissions.js';
import { CooldownMiddleware } from '../../middlewares/cooldown.js';
import { Validators } from '../../helpers/validators.js';
import Case from '../../database/schemas/Case.js';

class KickCommand extends BaseCommand {
    constructor() {
        super({
            name: 'kick',
            description: 'Kick a user from the server',
            category: 'moderation',
            permissions: [PermissionFlagsBits.KickMembers],
            botPermissions: [PermissionFlagsBits.KickMembers],
            cooldown: 3000
        });
    }

    async execute(interaction, client) {
        if (!await CooldownMiddleware.checkCooldown(interaction, client, this.name, this.cooldown)) return;
        if (!await PermissionMiddleware.checkPermissions(interaction, this.permissions)) return;
        if (!await PermissionMiddleware.checkBotPermissions(interaction, this.botPermissions)) return;

        const user = interaction.options.getUser('user');
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

        try {
            // Send DM to user before kicking
            try {
                const dmEmbed = CuteEmbedBuilder.warning(
                    'You have been kicked',
                    `You were kicked from **${interaction.guild.name}**\n\n**Reason:** ${reason}\n\nYou can rejoin with a new invite link.`
                );
                await user.send({ embeds: [dmEmbed] });
            } catch (error) {
                // User has DMs disabled
            }

            await member.kick(reason);

            // Create case in database
            const newCase = new Case({
                guildId: interaction.guild.id,
                userId: user.id,
                moderatorId: interaction.user.id,
                type: 'kick',
                reason: reason
            });
            await newCase.save();

            const successEmbed = CuteEmbedBuilder.moderation('kick', user, interaction.user, reason);
            successEmbed.addFields({ name: 'Case ID', value: newCase.caseId.slice(0, 8), inline: true });

            await interaction.reply({ embeds: [successEmbed] });

            client.log(`${interaction.user.tag} kicked ${user.tag} for: ${reason}`, 'info');

        } catch (error) {
            client.log(`Failed to kick ${user.tag}: ${error.message}`, 'error');
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Kick Failed', `Failed to kick ${user.tag}: ${error.message}`)],
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
                    .setDescription('The user to kick')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for the kick')
                    .setMaxLength(512))
            .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
            .toJSON();
    }
}

export default new KickCommand();