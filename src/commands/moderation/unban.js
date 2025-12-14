import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../middlewares/permissions.js';
import { CooldownMiddleware } from '../../middlewares/cooldown.js';
import { Validators } from '../../helpers/validators.js';
import Case from '../../database/schemas/Case.js';

class UnbanCommand extends BaseCommand {
    constructor() {
        super({
            name: 'unban',
            description: 'Unban a user from the server',
            category: 'moderation',
            permissions: [PermissionFlagsBits.BanMembers],
            botPermissions: [PermissionFlagsBits.BanMembers],
            cooldown: 3000
        });
    }

    async execute(interaction, client) {
        if (!await CooldownMiddleware.checkCooldown(interaction, client, this.name, this.cooldown)) return;
        if (!await PermissionMiddleware.checkPermissions(interaction, this.permissions)) return;
        if (!await PermissionMiddleware.checkBotPermissions(interaction, this.botPermissions)) return;

        const userId = interaction.options.getString('user_id');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!Validators.isValidUserId(userId)) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Invalid User ID', 'Please provide a valid user ID!')],
                ephemeral: true
            });
        }

        try {
            const bans = await interaction.guild.bans.fetch();
            const bannedUser = bans.get(userId);

            if (!bannedUser) {
                return await interaction.reply({
                    embeds: [CuteEmbedBuilder.error('User Not Banned', 'This user is not banned from the server!')],
                    ephemeral: true
                });
            }

            await interaction.guild.members.unban(userId, reason);

            // Update ban cases
            await Case.updateMany(
                { guildId: interaction.guild.id, userId: userId, type: 'ban', active: true },
                { active: false }
            );

            // Create unban case
            const newCase = new Case({
                guildId: interaction.guild.id,
                userId: userId,
                moderatorId: interaction.user.id,
                type: 'unban',
                reason: reason
            });
            await newCase.save();

            const successEmbed = CuteEmbedBuilder.moderation('unban', bannedUser.user, interaction.user, reason);
            successEmbed.addFields({ name: 'Case ID', value: newCase.caseId.slice(0, 8), inline: true });

            await interaction.reply({ embeds: [successEmbed] });

            client.log(`${interaction.user.tag} unbanned ${bannedUser.user.tag}: ${reason}`, 'info');

        } catch (error) {
            client.log(`Failed to unban user ${userId}: ${error.message}`, 'error');
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Unban Failed', `Failed to unban user: ${error.message}`)],
                ephemeral: true
            });
        }
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('user_id')
                    .setDescription('The user ID to unban')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for the unban')
                    .setMaxLength(512))
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
            .toJSON();
    }
}

export default new UnbanCommand();