import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../middlewares/permissions.js';
import { CooldownMiddleware } from '../../middlewares/cooldown.js';

class PruneCommand extends BaseCommand {
    constructor() {
        super({
            name: 'prune',
            description: 'Remove inactive members from the server',
            category: 'moderation',
            permissions: [PermissionFlagsBits.KickMembers],
            botPermissions: [PermissionFlagsBits.KickMembers],
            cooldown: 10000
        });
    }

    async execute(interaction, client) {
        if (!await CooldownMiddleware.checkCooldown(interaction, client, this.name, this.cooldown)) return;
        if (!await PermissionMiddleware.checkPermissions(interaction, this.permissions)) return;
        if (!await PermissionMiddleware.checkBotPermissions(interaction, this.botPermissions)) return;

        const days = interaction.options.getInteger('days');
        const dryRun = interaction.options.getBoolean('dry_run') || false;
        const reason = interaction.options.getString('reason') || 'Inactive member cleanup';

        if (days < 1 || days > 30) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Invalid Days', 'Days must be between 1 and 30!')],
                ephemeral: true
            });
        }

        try {
            await interaction.deferReply();

            const pruneCount = await interaction.guild.members.prune({
                days: days,
                dry: dryRun,
                reason: reason
            });

            const actionText = dryRun ? 'would be pruned' : 'were pruned';
            const title = dryRun ? 'Prune Preview' : 'Members Pruned';

            const pruneEmbed = CuteEmbedBuilder.success(
                title,
                `**${pruneCount}** members ${actionText} for being inactive for ${days} days! 🧹`
            );

            pruneEmbed.addFields([
                { name: 'Inactive Days', value: days.toString(), inline: true },
                { name: 'Action Type', value: dryRun ? 'Preview' : 'Executed', inline: true },
                { name: 'Moderator', value: interaction.user.toString(), inline: true },
                { name: 'Reason', value: reason, inline: false }
            ]);

            if (dryRun) {
                pruneEmbed.setFooter({ text: 'This was a preview. Run without dry_run to execute.' });
            }

            await interaction.editReply({ embeds: [pruneEmbed] });

            if (!dryRun) {
                client.log(`${interaction.user.tag} pruned ${pruneCount} members (${days} days inactive): ${reason}`, 'info');
            }

        } catch (error) {
            client.log(`Failed to prune members: ${error.message}`, 'error');
            await interaction.editReply({
                embeds: [CuteEmbedBuilder.error('Prune Failed', `Failed to prune members: ${error.message}`)]
            });
        }
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addIntegerOption(option =>
                option.setName('days')
                    .setDescription('Days of inactivity (1-30)')
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(30))
            .addBooleanOption(option =>
                option.setName('dry_run')
                    .setDescription('Preview without actually pruning'))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for pruning')
                    .setMaxLength(512))
            .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
            .toJSON();
    }
}

export default new PruneCommand();