import { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } from 'discord.js';
import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../middlewares/permissions.js';

export default {
    name: 'Delete Message',
    type: ApplicationCommandType.Message,
    
    async execute(interaction, client) {
        if (!await PermissionMiddleware.checkPermissions(interaction, [PermissionFlagsBits.ManageMessages])) return;
        if (!await PermissionMiddleware.checkBotPermissions(interaction, [PermissionFlagsBits.ManageMessages])) return;

        const targetMessage = interaction.targetMessage;

        if (!targetMessage.deletable) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Cannot Delete', 'I cannot delete this message!')],
                ephemeral: true
            });
        }

        try {
            const messageContent = targetMessage.content.slice(0, 100) + (targetMessage.content.length > 100 ? '...' : '');
            const messageAuthor = targetMessage.author.tag;

            await targetMessage.delete();

            const deleteEmbed = CuteEmbedBuilder.success(
                'Message Deleted',
                `Successfully deleted message from **${messageAuthor}**! 🗑️`
            );

            if (messageContent) {
                deleteEmbed.addFields({ name: 'Content Preview', value: `\`${messageContent}\``, inline: false });
            }

            deleteEmbed.addFields([
                { name: 'Author', value: messageAuthor, inline: true },
                { name: 'Channel', value: targetMessage.channel.toString(), inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true }
            ]);

            await interaction.reply({ embeds: [deleteEmbed], ephemeral: true });

            client.log(`${interaction.user.tag} deleted message from ${messageAuthor} in ${targetMessage.channel.name}`, 'info');

        } catch (error) {
            client.log(`Failed to delete message: ${error.message}`, 'error');
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Delete Failed', `Failed to delete message: ${error.message}`)],
                ephemeral: true
            });
        }
    },

    toJSON() {
        return new ContextMenuCommandBuilder()
            .setName(this.name)
            .setType(this.type)
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
            .toJSON();
    }
};