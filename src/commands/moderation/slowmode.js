import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import BaseCommand from '../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../middlewares/permissions.js';
import { CooldownMiddleware } from '../../middlewares/cooldown.js';
import { TimeUtils } from '../../helpers/timeUtils.js';

class SlowmodeCommand extends BaseCommand {
    constructor() {
        super({
            name: 'slowmode',
            description: 'Set slowmode for a channel',
            category: 'moderation',
            permissions: [PermissionFlagsBits.ManageChannels],
            botPermissions: [PermissionFlagsBits.ManageChannels],
            cooldown: 3000
        });
    }

    async execute(interaction, client) {
        if (!await CooldownMiddleware.checkCooldown(interaction, client, this.name, this.cooldown)) return;
        if (!await PermissionMiddleware.checkPermissions(interaction, this.permissions)) return;
        if (!await PermissionMiddleware.checkBotPermissions(interaction, this.botPermissions)) return;

        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'Slowmode adjustment';

        if (channel.type !== ChannelType.GuildText) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Invalid Channel', 'Can only set slowmode on text channels!')],
                ephemeral: true
            });
        }

        if (duration < 0 || duration > 21600) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Invalid Duration', 'Slowmode must be between 0 and 21600 seconds (6 hours)!')],
                ephemeral: true
            });
        }

        try {
            await channel.setRateLimitPerUser(duration, reason);

            let description;
            if (duration === 0) {
                description = `Slowmode has been disabled for ${channel}! 🚀`;
            } else {
                description = `Slowmode set to **${TimeUtils.formatDuration(duration * 1000)}** for ${channel}! 🐌`;
            }

            const slowmodeEmbed = CuteEmbedBuilder.success('Slowmode Updated', description);
            slowmodeEmbed.addFields([
                { name: 'Channel', value: channel.toString(), inline: true },
                { name: 'Duration', value: duration === 0 ? 'Disabled' : `${duration} seconds`, inline: true },
                { name: 'Moderator', value: interaction.user.toString(), inline: true },
                { name: 'Reason', value: reason, inline: false }
            ]);

            await interaction.reply({ embeds: [slowmodeEmbed] });

            client.log(`${interaction.user.tag} set slowmode to ${duration}s in ${channel.name}: ${reason}`, 'info');

        } catch (error) {
            client.log(`Failed to set slowmode in ${channel.name}: ${error.message}`, 'error');
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Slowmode Failed', `Failed to set slowmode: ${error.message}`)],
                ephemeral: true
            });
        }
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addIntegerOption(option =>
                option.setName('duration')
                    .setDescription('Slowmode duration in seconds (0 to disable)')
                    .setRequired(true)
                    .setMinValue(0)
                    .setMaxValue(21600))
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('Channel to set slowmode (defaults to current)')
                    .addChannelTypes(ChannelType.GuildText))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for slowmode change')
                    .setMaxLength(512))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
            .toJSON();
    }
}

export default new SlowmodeCommand();