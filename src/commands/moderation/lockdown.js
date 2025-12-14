import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import BaseCommand from '../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../middlewares/permissions.js';
import { CooldownMiddleware } from '../../middlewares/cooldown.js';
import { TimeUtils } from '../../helpers/timeUtils.js';

class LockdownCommand extends BaseCommand {
    constructor() {
        super({
            name: 'lockdown',
            description: 'Lock down a channel to prevent messages',
            category: 'moderation',
            permissions: [PermissionFlagsBits.ManageChannels],
            botPermissions: [PermissionFlagsBits.ManageChannels],
            cooldown: 5000
        });
    }

    async execute(interaction, client) {
        if (!await CooldownMiddleware.checkCooldown(interaction, client, this.name, this.cooldown)) return;
        if (!await PermissionMiddleware.checkPermissions(interaction, this.permissions)) return;
        if (!await PermissionMiddleware.checkBotPermissions(interaction, this.botPermissions)) return;

        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const reason = interaction.options.getString('reason') || 'Channel lockdown';
        const duration = interaction.options.getString('duration');

        if (channel.type !== ChannelType.GuildText) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Invalid Channel', 'Can only lockdown text channels!')],
                ephemeral: true
            });
        }

        try {
            const everyone = interaction.guild.roles.everyone;
            const currentPerms = channel.permissionOverwrites.cache.get(everyone.id);
            
            if (currentPerms && currentPerms.deny.has(PermissionFlagsBits.SendMessages)) {
                return await interaction.reply({
                    embeds: [CuteEmbedBuilder.error('Already Locked', 'This channel is already locked down!')],
                    ephemeral: true
                });
            }

            await channel.permissionOverwrites.edit(everyone, {
                SendMessages: false,
                AddReactions: false,
                CreatePublicThreads: false,
                CreatePrivateThreads: false
            }, { reason });

            const lockEmbed = CuteEmbedBuilder.success(
                'Channel Locked Down',
                `${channel} has been locked down successfully! 🔒`
            );

            lockEmbed.addFields([
                { name: 'Moderator', value: interaction.user.toString(), inline: true },
                { name: 'Reason', value: reason, inline: true }
            ]);

            if (duration) {
                const durationMs = TimeUtils.parseTime(duration);
                if (durationMs) {
                    lockEmbed.addFields({ 
                        name: 'Duration', 
                        value: TimeUtils.formatDuration(durationMs), 
                        inline: true 
                    });

                    // Auto-unlock after duration
                    setTimeout(async () => {
                        try {
                            await channel.permissionOverwrites.edit(everyone, {
                                SendMessages: null,
                                AddReactions: null,
                                CreatePublicThreads: null,
                                CreatePrivateThreads: null
                            }, { reason: 'Auto-unlock after lockdown duration' });

                            const unlockEmbed = CuteEmbedBuilder.success(
                                'Channel Auto-Unlocked',
                                `${channel} has been automatically unlocked! 🔓`
                            );

                            await channel.send({ embeds: [unlockEmbed] });
                        } catch (error) {
                            client.log(`Failed to auto-unlock ${channel.name}: ${error.message}`, 'error');
                        }
                    }, durationMs);
                }
            }

            await interaction.reply({ embeds: [lockEmbed] });

            // Send lockdown notice to channel
            const noticeEmbed = CuteEmbedBuilder.warning(
                'Channel Locked Down',
                `This channel has been locked by ${interaction.user}.\n\n**Reason:** ${reason}`
            );

            await channel.send({ embeds: [noticeEmbed] });

            client.log(`${interaction.user.tag} locked down ${channel.name}: ${reason}`, 'info');

        } catch (error) {
            client.log(`Failed to lockdown ${channel.name}: ${error.message}`, 'error');
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Lockdown Failed', `Failed to lock down channel: ${error.message}`)],
                ephemeral: true
            });
        }
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('Channel to lock down (defaults to current)')
                    .addChannelTypes(ChannelType.GuildText))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for lockdown')
                    .setMaxLength(512))
            .addStringOption(option =>
                option.setName('duration')
                    .setDescription('Duration of lockdown (e.g., 1h, 30m)'))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
            .toJSON();
    }
}

export default new LockdownCommand();