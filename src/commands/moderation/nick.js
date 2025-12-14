import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../middlewares/permissions.js';
import { CooldownMiddleware } from '../../middlewares/cooldown.js';

class NickCommand extends BaseCommand {
    constructor() {
        super({
            name: 'nick',
            description: 'Change a user\'s nickname',
            category: 'moderation',
            permissions: [PermissionFlagsBits.ManageNicknames],
            botPermissions: [PermissionFlagsBits.ManageNicknames],
            cooldown: 2000
        });
    }

    async execute(interaction, client) {
        if (!await CooldownMiddleware.checkCooldown(interaction, client, this.name, this.cooldown)) return;
        if (!await PermissionMiddleware.checkPermissions(interaction, this.permissions)) return;
        if (!await PermissionMiddleware.checkBotPermissions(interaction, this.botPermissions)) return;

        const user = interaction.options.getUser('user');
        const nickname = interaction.options.getString('nickname');
        const reason = interaction.options.getString('reason') || `Nickname changed by ${interaction.user.tag}`;

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('User Not Found', 'This user is not in the server!')],
                ephemeral: true
            });
        }

        if (!await PermissionMiddleware.checkHierarchy(interaction, member)) return;

        if (nickname && nickname.length > 32) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Nickname Too Long', 'Nicknames must be 32 characters or less!')],
                ephemeral: true
            });
        }

        try {
            const oldNickname = member.nickname || member.user.username;
            await member.setNickname(nickname, reason);

            const action = nickname ? 'Changed' : 'Reset';
            const newNick = nickname || member.user.username;

            const nickEmbed = CuteEmbedBuilder.success(
                `Nickname ${action}`,
                `Successfully ${action.toLowerCase()} ${user}'s nickname! ✨`
            );

            nickEmbed.addFields([
                { name: 'User', value: user.tag, inline: true },
                { name: 'Old Nickname', value: oldNickname, inline: true },
                { name: 'New Nickname', value: newNick, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true },
                { name: 'Reason', value: reason, inline: false }
            ]);

            await interaction.reply({ embeds: [nickEmbed] });

            client.log(`${interaction.user.tag} changed ${user.tag}'s nickname from "${oldNickname}" to "${newNick}": ${reason}`, 'info');

        } catch (error) {
            client.log(`Failed to change nickname: ${error.message}`, 'error');
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Nickname Change Failed', `Failed to change nickname: ${error.message}`)],
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
                    .setDescription('The user to change nickname for')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('nickname')
                    .setDescription('New nickname (leave empty to reset)')
                    .setMaxLength(32))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for nickname change')
                    .setMaxLength(512))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
            .toJSON();
    }
}

export default new NickCommand();