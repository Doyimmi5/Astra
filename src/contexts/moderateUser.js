import { ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';
import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../middlewares/permissions.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    name: 'Moderate User',
    type: ApplicationCommandType.User,
    
    async execute(interaction, client) {
        const targetUser = interaction.targetUser;
        const targetMember = interaction.guild.members.cache.get(targetUser.id);

        if (!await PermissionMiddleware.checkSelfModeration(interaction, targetUser)) return;
        if (targetMember && !await PermissionMiddleware.checkHierarchy(interaction, targetMember)) return;

        const moderationRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`quick_warn_${targetUser.id}`)
                    .setLabel('Warn')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚠️'),
                new ButtonBuilder()
                    .setCustomId(`quick_mute_${targetUser.id}`)
                    .setLabel('Mute')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🤐'),
                new ButtonBuilder()
                    .setCustomId(`quick_kick_${targetUser.id}`)
                    .setLabel('Kick')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('👢'),
                new ButtonBuilder()
                    .setCustomId(`quick_ban_${targetUser.id}`)
                    .setLabel('Ban')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔨')
            );

        const moderateEmbed = CuteEmbedBuilder.info(
            'Quick Moderation',
            `Select an action for **${targetUser.tag}**`
        );

        moderateEmbed.setThumbnail(targetUser.displayAvatarURL());
        moderateEmbed.addFields([
            { name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
            { name: 'Joined', value: targetMember ? `<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:R>` : 'Not in server', inline: true },
            { name: 'Account Created', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true }
        ]);

        await interaction.reply({
            embeds: [moderateEmbed],
            components: [moderationRow],
            ephemeral: true
        });
    },

    toJSON() {
        return new ContextMenuCommandBuilder()
            .setName(this.name)
            .setType(this.type)
            .toJSON();
    }
};