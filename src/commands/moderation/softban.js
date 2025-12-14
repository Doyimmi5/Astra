import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../middlewares/permissions.js';
import { CooldownMiddleware } from '../../middlewares/cooldown.js';
import Case from '../../database/schemas/Case.js';

class SoftbanCommand extends BaseCommand {
    constructor() {
        super({
            name: 'softban',
            description: 'Ban and immediately unban a user to delete their messages',
            category: 'moderation',
            permissions: [PermissionFlagsBits.BanMembers],
            botPermissions: [PermissionFlagsBits.BanMembers],
            cooldown: 5000
        });
    }

    async execute(interaction, client) {
        if (!await CooldownMiddleware.checkCooldown(interaction, client, this.name, this.cooldown)) return;
        if (!await PermissionMiddleware.checkPermissions(interaction, this.permissions)) return;
        if (!await PermissionMiddleware.checkBotPermissions(interaction, this.botPermissions)) return;

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Softban - message cleanup';
        const deleteMessages = interaction.options.getInteger('delete_messages') || 7;

        if (!await PermissionMiddleware.checkSelfModeration(interaction, user)) return;

        const member = interaction.guild.members.cache.get(user.id);
        if (member && !await PermissionMiddleware.checkHierarchy(interaction, member)) return;

        try {
            await interaction.deferReply();

            await interaction.guild.members.ban(user.id, {
                reason: `Softban by ${interaction.user.tag}: ${reason}`,
                deleteMessageDays: deleteMessages
            });

            await interaction.guild.members.unban(user.id, `Softban unban by ${interaction.user.tag}`);

            const newCase = new Case({
                guildId: interaction.guild.id,
                userId: user.id,
                moderatorId: interaction.user.id,
                type: 'softban',
                reason: reason
            });
            await newCase.save();

            const successEmbed = CuteEmbedBuilder.moderation('softban', user, interaction.user, reason);
            successEmbed.addFields(
                { name: 'Case ID', value: newCase.caseId.slice(0, 8), inline: true },
                { name: 'Messages Deleted', value: `${deleteMessages} days`, inline: true }
            );

            await interaction.editReply({ embeds: [successEmbed] });

            client.log(`${interaction.user.tag} softbanned ${user.tag}: ${reason}`, 'info');

        } catch (error) {
            client.log(`Failed to softban ${user.tag}: ${error.message}`, 'error');
            await interaction.editReply({
                embeds: [CuteEmbedBuilder.error('Softban Failed', `Failed to softban ${user.tag}: ${error.message}`)]
            });
        }
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to softban')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for the softban')
                    .setMaxLength(512))
            .addIntegerOption(option =>
                option.setName('delete_messages')
                    .setDescription('Days of messages to delete (1-7)')
                    .setMinValue(1)
                    .setMaxValue(7))
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
            .toJSON();
    }
}

export default new SoftbanCommand();