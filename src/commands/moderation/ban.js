import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../middlewares/permissions.js';
import { CooldownMiddleware } from '../../middlewares/cooldown.js';
import { TimeUtils } from '../../helpers/timeUtils.js';
import { Validators } from '../../helpers/validators.js';
import Case from '../../database/schemas/Case.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

class BanCommand extends BaseCommand {
    constructor() {
        super({
            name: 'ban',
            description: 'Ban a user from the server',
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
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const deleteMessages = interaction.options.getInteger('delete_messages') || 0;

        if (!await PermissionMiddleware.checkSelfModeration(interaction, user)) return;

        const member = interaction.guild.members.cache.get(user.id);
        if (member && !await PermissionMiddleware.checkHierarchy(interaction, member)) return;

        if (!Validators.isValidReason(reason)) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Invalid Reason', 'Reason must be 512 characters or less!')],
                ephemeral: true
            });
        }

        const confirmRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`ban_confirm_${user.id}`)
                    .setLabel('Confirm Ban')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔨'),
                new ButtonBuilder()
                    .setCustomId(`ban_cancel_${user.id}`)
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('❌')
            );

        const confirmEmbed = CuteEmbedBuilder.warning(
            '🔨 Confirm Ban Action',
            `⚠️ **This action cannot be undone!**\n\n👤 **Target:** ${user.tag} (${user.id})\n📝 **Reason:** ${reason}\n🗑️ **Delete Messages:** ${deleteMessages} days\n👮 **Moderator:** ${interaction.user.tag}`
        );
        
        confirmEmbed.setThumbnail(user.displayAvatarURL());
        confirmEmbed.setFooter({ text: 'Click confirm to proceed or cancel to abort' });

        await interaction.reply({
            embeds: [confirmEmbed],
            components: [confirmRow],
            ephemeral: true
        });

        // Store ban data for confirmation
        client.cache.set(`ban_${user.id}_${interaction.user.id}`, {
            user,
            reason,
            deleteMessages,
            moderator: interaction.user
        });
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to ban')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for the ban')
                    .setMaxLength(512))
            .addIntegerOption(option =>
                option.setName('delete_messages')
                    .setDescription('Days of messages to delete (0-7)')
                    .setMinValue(0)
                    .setMaxValue(7))
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
            .toJSON();
    }
}

export default new BanCommand();