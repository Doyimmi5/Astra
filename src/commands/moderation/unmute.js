import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../middlewares/permissions.js';
import { CooldownMiddleware } from '../../middlewares/cooldown.js';
import { Validators } from '../../helpers/validators.js';
import Case from '../../database/schemas/Case.js';

class UnmuteCommand extends BaseCommand {
    constructor() {
        super({
            name: 'unmute',
            description: 'Remove timeout from a user',
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
        const reason = interaction.options.getString('reason') || 'No reason provided';

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('User Not Found', 'This user is not in the server!')],
                ephemeral: true
            });
        }

        if (!member.isCommunicationDisabled()) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Not Muted', 'This user is not currently timed out!')],
                ephemeral: true
            });
        }

        try {
            await member.timeout(null, reason);

            // Update case in database
            await Case.updateMany(
                { guildId: interaction.guild.id, userId: user.id, type: 'mute', active: true },
                { active: false }
            );

            // Create unmute case
            const newCase = new Case({
                guildId: interaction.guild.id,
                userId: user.id,
                moderatorId: interaction.user.id,
                type: 'unmute',
                reason: reason
            });
            await newCase.save();

            const successEmbed = CuteEmbedBuilder.moderation('unmute', user, interaction.user, reason);
            successEmbed.addFields({ name: 'Case ID', value: newCase.caseId.slice(0, 8), inline: true });

            await interaction.reply({ embeds: [successEmbed] });

            client.log(`${interaction.user.tag} unmuted ${user.tag}: ${reason}`, 'info');

        } catch (error) {
            client.log(`Failed to unmute ${user.tag}: ${error.message}`, 'error');
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Unmute Failed', `Failed to unmute ${user.tag}: ${error.message}`)],
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
                    .setDescription('The user to unmute')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for the unmute')
                    .setMaxLength(512))
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
            .toJSON();
    }
}

export default new UnmuteCommand();