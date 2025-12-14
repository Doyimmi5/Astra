import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../middlewares/permissions.js';
import { CooldownMiddleware } from '../../middlewares/cooldown.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import msleep from 'msleep';

class ClearCommand extends BaseCommand {
    constructor() {
        super({
            name: 'clear',
            description: 'Delete messages from the channel',
            category: 'moderation',
            permissions: [PermissionFlagsBits.ManageMessages],
            botPermissions: [PermissionFlagsBits.ManageMessages],
            cooldown: 5000
        });
    }

    async execute(interaction, client) {
        if (!await CooldownMiddleware.checkCooldown(interaction, client, this.name, this.cooldown)) return;
        if (!await PermissionMiddleware.checkPermissions(interaction, this.permissions)) return;
        if (!await PermissionMiddleware.checkBotPermissions(interaction, this.botPermissions)) return;

        const amount = interaction.options.getInteger('amount');
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Message cleanup';

        if (amount < 1 || amount > 100) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Invalid Amount', 'Amount must be between 1 and 100!')],
                ephemeral: true
            });
        }

        const confirmRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`clear_confirm_${amount}_${user?.id || 'all'}`)
                    .setLabel(`Delete ${amount} Messages`)
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🧹'),
                new ButtonBuilder()
                    .setCustomId('clear_cancel')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('❌')
            );

        const description = user 
            ? `🗑️ **Target:** ${user.tag}\n📊 **Amount:** ${amount} messages\n📍 **Channel:** ${interaction.channel}\n⚠️ **This action cannot be undone!**`
            : `📊 **Amount:** ${amount} messages\n📍 **Channel:** ${interaction.channel}\n⏰ **Messages older than 14 days will be skipped**\n⚠️ **This action cannot be undone!**`;

        const confirmEmbed = CuteEmbedBuilder.warning('🧹 Confirm Message Cleanup', description);
        confirmEmbed.setFooter({ text: 'Click to confirm or cancel the operation' });

        await interaction.reply({
            embeds: [confirmEmbed],
            components: [confirmRow],
            ephemeral: true
        });

        // Store clear data for confirmation
        client.cache.set(`clear_${interaction.user.id}`, {
            amount,
            user,
            reason,
            channel: interaction.channel,
            moderator: interaction.user
        });
    }

    static async executeClear(interaction, client, amount, targetUser = null, reason = 'Message cleanup') {
        try {
            await interaction.deferReply({ ephemeral: true });

            let deletedCount = 0;
            const channel = interaction.channel;

            if (targetUser) {
                // Delete messages from specific user
                const messages = await channel.messages.fetch({ limit: 100 });
                const userMessages = messages.filter(m => m.author.id === targetUser.id).first(amount);
                
                for (const message of userMessages) {
                    try {
                        await message.delete();
                        deletedCount++;
                        await msleep(100); // Rate limit protection
                    } catch (error) {
                        // Message might be too old or already deleted
                    }
                }
            } else {
                // Bulk delete messages
                const messages = await channel.messages.fetch({ limit: amount });
                const deletableMessages = messages.filter(m => Date.now() - m.createdTimestamp < 1209600000); // 14 days
                
                if (deletableMessages.size > 0) {
                    const deleted = await channel.bulkDelete(deletableMessages, true);
                    deletedCount = deleted.size;
                }
            }

            const successEmbed = CuteEmbedBuilder.success(
                'Messages Deleted',
                `Successfully deleted **${deletedCount}** messages! 🧹`
            );

            if (targetUser) {
                successEmbed.addFields({ name: 'Target User', value: targetUser.tag, inline: true });
            }

            successEmbed.addFields(
                { name: 'Reason', value: reason, inline: true },
                { name: 'Channel', value: channel.toString(), inline: true }
            );

            await interaction.editReply({ embeds: [successEmbed] });

            client.log(`${interaction.user.tag} cleared ${deletedCount} messages in ${channel.name}`, 'info');

        } catch (error) {
            client.log(`Failed to clear messages: ${error.message}`, 'error');
            await interaction.editReply({
                embeds: [CuteEmbedBuilder.error('Clear Failed', `Failed to delete messages: ${error.message}`)]
            });
        }
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addIntegerOption(option =>
                option.setName('amount')
                    .setDescription('Number of messages to delete (1-100)')
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(100))
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('Delete messages from specific user'))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for clearing messages')
                    .setMaxLength(512))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
            .toJSON();
    }
}

export default new ClearCommand();