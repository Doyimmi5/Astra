import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../middlewares/permissions.js';
import { CooldownMiddleware } from '../../middlewares/cooldown.js';
import User from '../../database/schemas/User.js';

class WarningsCommand extends BaseCommand {
    constructor() {
        super({
            name: 'warnings',
            description: 'View or clear user warnings',
            category: 'moderation',
            permissions: [PermissionFlagsBits.ModerateMembers],
            cooldown: 2000
        });
    }

    async execute(interaction, client) {
        if (!await CooldownMiddleware.checkCooldown(interaction, client, this.name, this.cooldown)) return;
        if (!await PermissionMiddleware.checkPermissions(interaction, this.permissions)) return;

        const action = interaction.options.getString('action');
        const user = interaction.options.getUser('user');

        try {
            const userDoc = await User.findOne({ userId: user.id });
            
            if (!userDoc || !userDoc.warnings.length) {
                return await interaction.reply({
                    embeds: [CuteEmbedBuilder.info('No Warnings', `${user.tag} has no warnings.`)],
                    ephemeral: true
                });
            }

            const guildWarnings = userDoc.warnings.filter(w => w.guildId === interaction.guild.id && w.active);

            if (action === 'view') {
                if (guildWarnings.length === 0) {
                    return await interaction.reply({
                        embeds: [CuteEmbedBuilder.info('No Warnings', `${user.tag} has no warnings in this server.`)],
                        ephemeral: true
                    });
                }

                const warningsEmbed = CuteEmbedBuilder.info(
                    `Warnings for ${user.tag}`,
                    `Found ${guildWarnings.length} active warning(s)`
                );

                warningsEmbed.setThumbnail(user.displayAvatarURL());

                guildWarnings.slice(0, 10).forEach((warning, index) => {
                    warningsEmbed.addFields({
                        name: `Warning #${index + 1}`,
                        value: `**Reason:** ${warning.reason}\n**Moderator:** <@${warning.moderatorId}>\n**Date:** <t:${Math.floor(warning.date.getTime() / 1000)}:R>`,
                        inline: true
                    });
                });

                if (guildWarnings.length > 10) {
                    warningsEmbed.setFooter({ text: `Showing 10 of ${guildWarnings.length} warnings` });
                }

                await interaction.reply({ embeds: [warningsEmbed] });

            } else if (action === 'clear') {
                if (guildWarnings.length === 0) {
                    return await interaction.reply({
                        embeds: [CuteEmbedBuilder.error('No Warnings', `${user.tag} has no warnings to clear in this server.`)],
                        ephemeral: true
                    });
                }

                // Mark warnings as inactive
                userDoc.warnings.forEach(warning => {
                    if (warning.guildId === interaction.guild.id && warning.active) {
                        warning.active = false;
                    }
                });

                await userDoc.save();

                const clearEmbed = CuteEmbedBuilder.success(
                    'Warnings Cleared',
                    `Successfully cleared **${guildWarnings.length}** warning(s) for ${user}! ✨`
                );

                clearEmbed.addFields([
                    { name: 'User', value: user.tag, inline: true },
                    { name: 'Warnings Cleared', value: guildWarnings.length.toString(), inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true }
                ]);

                await interaction.reply({ embeds: [clearEmbed] });

                client.log(`${interaction.user.tag} cleared ${guildWarnings.length} warnings for ${user.tag}`, 'info');
            }

        } catch (error) {
            client.log(`Failed to manage warnings: ${error.message}`, 'error');
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Warnings Error', 'Failed to manage warnings!')],
                ephemeral: true
            });
        }
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('action')
                    .setDescription('View or clear warnings')
                    .setRequired(true)
                    .addChoices(
                        { name: 'View', value: 'view' },
                        { name: 'Clear', value: 'clear' }
                    ))
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to manage warnings for')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
            .toJSON();
    }
}

export default new WarningsCommand();