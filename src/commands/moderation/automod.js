import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../middlewares/permissions.js';
import { CooldownMiddleware } from '../../middlewares/cooldown.js';
import Guild from '../../database/schemas/Guild.js';

class AutomodCommand extends BaseCommand {
    constructor() {
        super({
            name: 'automod',
            description: 'Configure automatic moderation settings',
            category: 'moderation',
            permissions: [PermissionFlagsBits.ManageGuild],
            cooldown: 5000
        });
    }

    async execute(interaction, client) {
        if (!await CooldownMiddleware.checkCooldown(interaction, client, this.name, this.cooldown)) return;
        if (!await PermissionMiddleware.checkPermissions(interaction, this.permissions)) return;

        const setting = interaction.options.getString('setting');
        const enabled = interaction.options.getBoolean('enabled');

        try {
            let guildDoc = await Guild.findOne({ guildId: interaction.guild.id });
            if (!guildDoc) {
                guildDoc = new Guild({ guildId: interaction.guild.id });
            }

            const oldValue = guildDoc.automod[setting];
            guildDoc.automod[setting] = enabled;
            await guildDoc.save();

            const statusText = enabled ? 'enabled' : 'disabled';
            const emoji = enabled ? '✅' : '❌';

            const automodEmbed = CuteEmbedBuilder.success(
                'AutoMod Updated',
                `${emoji} **${setting.charAt(0).toUpperCase() + setting.slice(1)}** has been ${statusText}!`
            );

            automodEmbed.addFields([
                { name: 'Setting', value: setting, inline: true },
                { name: 'Previous', value: oldValue ? 'Enabled' : 'Disabled', inline: true },
                { name: 'Current', value: enabled ? 'Enabled' : 'Disabled', inline: true },
                { name: 'Moderator', value: interaction.user.toString(), inline: false }
            ]);

            // Show current automod status
            const currentSettings = [
                `**Anti-Spam:** ${guildDoc.automod.antiSpam ? '✅' : '❌'}`,
                `**Anti-Raid:** ${guildDoc.automod.antiRaid ? '✅' : '❌'}`,
                `**Auto-Delete:** ${guildDoc.automod.autoDelete ? '✅' : '❌'}`,
                `**Enabled:** ${guildDoc.automod.enabled ? '✅' : '❌'}`
            ];

            automodEmbed.addFields({
                name: 'Current AutoMod Settings',
                value: currentSettings.join('\n'),
                inline: false
            });

            await interaction.reply({ embeds: [automodEmbed] });

            client.log(`${interaction.user.tag} ${statusText} automod ${setting} in ${interaction.guild.name}`, 'info');

        } catch (error) {
            client.log(`Failed to update automod: ${error.message}`, 'error');
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error('AutoMod Error', 'Failed to update automod settings!')],
                ephemeral: true
            });
        }
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('setting')
                    .setDescription('AutoMod setting to configure')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Enable/Disable AutoMod', value: 'enabled' },
                        { name: 'Anti-Spam', value: 'antiSpam' },
                        { name: 'Anti-Raid', value: 'antiRaid' },
                        { name: 'Auto-Delete', value: 'autoDelete' }
                    ))
            .addBooleanOption(option =>
                option.setName('enabled')
                    .setDescription('Enable or disable this setting')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
            .toJSON();
    }
}

export default new AutomodCommand();