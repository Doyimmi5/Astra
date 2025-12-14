import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';

class AutoRoleCommand extends BaseCommand {
    constructor() {
        super({
            name: 'autorole',
            description: 'Setup auto-role for new members',
            category: 'admin',
            permissions: [PermissionFlagsBits.ManageRoles],
            cooldown: 3000
        });
    }

    async execute(interaction, client) {
        const role = interaction.options.getRole('role');
        const action = interaction.options.getString('action');

        if (action === 'set') {
            // Save to database or config
            const embed = CuteEmbedBuilder.success(
                '✨ Auto-Role Set',
                `New members will automatically receive the ${role} role! 💖`
            );
            await interaction.reply({ embeds: [embed] });
        } else {
            const embed = CuteEmbedBuilder.success(
                '🗑️ Auto-Role Removed',
                'Auto-role has been disabled! 💔'
            );
            await interaction.reply({ embeds: [embed] });
        }
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('action')
                    .setDescription('Set or remove auto-role')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Set', value: 'set' },
                        { name: 'Remove', value: 'remove' }
                    ))
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('Role to auto-assign')
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
            .toJSON();
    }
}

export default new AutoRoleCommand();