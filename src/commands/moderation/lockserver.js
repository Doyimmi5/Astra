import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import BaseCommand from '../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../middlewares/permissions.js';
import { CooldownMiddleware } from '../../middlewares/cooldown.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

class LockserverCommand extends BaseCommand {
    constructor() {
        super({
            name: 'lockserver',
            description: 'Lock all channels in the server (emergency)',
            category: 'moderation',
            permissions: [PermissionFlagsBits.Administrator],
            botPermissions: [PermissionFlagsBits.ManageChannels],
            cooldown: 60000
        });
    }

    async execute(interaction, client) {
        if (!await CooldownMiddleware.checkCooldown(interaction, client, this.name, this.cooldown)) return;
        if (!await PermissionMiddleware.checkPermissions(interaction, this.permissions)) return;
        if (!await PermissionMiddleware.checkBotPermissions(interaction, this.botPermissions)) return;

        const reason = interaction.options.getString('reason') || 'Emergency server lockdown';

        const confirmRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('lockserver_confirm')
                    .setLabel('CONFIRM LOCKDOWN')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🚨'),
                new ButtonBuilder()
                    .setCustomId('lockserver_cancel')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('❌')
            );

        const confirmEmbed = CuteEmbedBuilder.warning(
            '🚨 EMERGENCY SERVER LOCKDOWN',
            `**WARNING:** This will lock ALL text channels in the server!\n\n**Reason:** ${reason}\n\n⚠️ This action affects the entire server and should only be used in emergencies!`
        );

        await interaction.reply({
            embeds: [confirmEmbed],
            components: [confirmRow],
            ephemeral: true
        });

        // Store lockdown data
        client.cache.set(`lockserver_${interaction.user.id}`, {
            reason,
            moderator: interaction.user,
            guild: interaction.guild
        });
    }

    static async executeLockdown(interaction, client, reason, moderator) {
        try {
            await interaction.deferReply();

            const textChannels = interaction.guild.channels.cache.filter(
                channel => channel.type === ChannelType.GuildText
            );

            let locked = 0;
            let failed = 0;
            const everyone = interaction.guild.roles.everyone;

            for (const [, channel] of textChannels) {
                try {
                    const currentPerms = channel.permissionOverwrites.cache.get(everyone.id);
                    
                    // Skip if already locked
                    if (currentPerms && currentPerms.deny.has(PermissionFlagsBits.SendMessages)) {
                        continue;
                    }

                    await channel.permissionOverwrites.edit(everyone, {
                        SendMessages: false,
                        AddReactions: false,
                        CreatePublicThreads: false,
                        CreatePrivateThreads: false
                    }, { reason: `Server lockdown by ${moderator.tag}: ${reason}` });

                    locked++;

                    // Rate limit protection
                    if (locked % 5 === 0) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }

                } catch (error) {
                    failed++;
                    client.log(`Failed to lock ${channel.name}: ${error.message}`, 'error');
                }
            }

            const lockdownEmbed = CuteEmbedBuilder.success(
                '🚨 Server Lockdown Complete',
                `Emergency lockdown executed successfully!`
            );

            lockdownEmbed.addFields([
                { name: 'Channels Locked', value: locked.toString(), inline: true },
                { name: 'Failed', value: failed.toString(), inline: true },
                { name: 'Total Channels', value: textChannels.size.toString(), inline: true },
                { name: 'Moderator', value: moderator.toString(), inline: true },
                { name: 'Reason', value: reason, inline: false }
            ]);

            await interaction.editReply({ embeds: [lockdownEmbed] });

            // Send announcement to a system channel if available
            const systemChannel = interaction.guild.systemChannel || interaction.guild.channels.cache.find(c => c.type === ChannelType.GuildText);
            if (systemChannel) {
                const announcementEmbed = CuteEmbedBuilder.error(
                    '🚨 SERVER LOCKDOWN ACTIVE',
                    `This server has been locked down by ${moderator}.\n\n**Reason:** ${reason}\n\nPlease wait for further instructions from the moderation team.`
                );

                await systemChannel.send({ embeds: [announcementEmbed] }).catch(() => {});
            }

            client.log(`${moderator.tag} executed server lockdown: ${reason} (${locked} channels locked)`, 'info');

        } catch (error) {
            client.log(`Server lockdown failed: ${error.message}`, 'error');
            await interaction.editReply({
                embeds: [CuteEmbedBuilder.error('Lockdown Failed', `Failed to execute server lockdown: ${error.message}`)]
            });
        }
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for server lockdown')
                    .setMaxLength(512))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .toJSON();
    }
}

export default new LockserverCommand();