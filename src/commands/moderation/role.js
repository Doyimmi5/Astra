import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../middlewares/permissions.js';
import { CooldownMiddleware } from '../../middlewares/cooldown.js';

class RoleCommand extends BaseCommand {
    constructor() {
        super({
            name: 'role',
            description: 'Add or remove roles from users',
            category: 'moderation',
            permissions: [PermissionFlagsBits.ManageRoles],
            botPermissions: [PermissionFlagsBits.ManageRoles],
            cooldown: 3000
        });
    }

    async execute(interaction, client) {
        if (!await CooldownMiddleware.checkCooldown(interaction, client, this.name, this.cooldown)) return;
        if (!await PermissionMiddleware.checkPermissions(interaction, this.permissions)) return;
        if (!await PermissionMiddleware.checkBotPermissions(interaction, this.botPermissions)) return;

        const action = interaction.options.getString('action');
        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');
        const reason = interaction.options.getString('reason') || `Role ${action} by ${interaction.user.tag}`;

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('User Not Found', 'This user is not in the server!')],
                ephemeral: true
            });
        }

        if (!await PermissionMiddleware.checkHierarchy(interaction, member)) return;

        const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
        if (role.position >= botMember.roles.highest.position) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Role Too High', 'I cannot manage this role as it\'s higher than my highest role!')],
                ephemeral: true
            });
        }

        const memberHighestRole = interaction.guild.members.cache.get(interaction.user.id).roles.highest;
        if (role.position >= memberHighestRole.position && interaction.user.id !== interaction.guild.ownerId) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Role Too High', 'You cannot manage this role as it\'s higher than your highest role!')],
                ephemeral: true
            });
        }

        try {
            if (action === 'add') {
                if (member.roles.cache.has(role.id)) {
                    return await interaction.reply({
                        embeds: [CuteEmbedBuilder.error('Already Has Role', `${user.tag} already has the ${role.name} role!`)],
                        ephemeral: true
                    });
                }

                await member.roles.add(role, reason);
                
                const addEmbed = CuteEmbedBuilder.success(
                    'Role Added',
                    `Successfully added **${role.name}** to ${user}! ✨`
                );
                addEmbed.addFields([
                    { name: 'User', value: user.tag, inline: true },
                    { name: 'Role', value: role.name, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                ]);

                await interaction.reply({ embeds: [addEmbed] });

            } else if (action === 'remove') {
                if (!member.roles.cache.has(role.id)) {
                    return await interaction.reply({
                        embeds: [CuteEmbedBuilder.error('Doesn\'t Have Role', `${user.tag} doesn't have the ${role.name} role!`)],
                        ephemeral: true
                    });
                }

                await member.roles.remove(role, reason);
                
                const removeEmbed = CuteEmbedBuilder.success(
                    'Role Removed',
                    `Successfully removed **${role.name}** from ${user}! 🗑️`
                );
                removeEmbed.addFields([
                    { name: 'User', value: user.tag, inline: true },
                    { name: 'Role', value: role.name, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                ]);

                await interaction.reply({ embeds: [removeEmbed] });
            }

            client.log(`${interaction.user.tag} ${action}ed role ${role.name} ${action === 'add' ? 'to' : 'from'} ${user.tag}: ${reason}`, 'info');

        } catch (error) {
            client.log(`Failed to ${action} role: ${error.message}`, 'error');
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Role Action Failed', `Failed to ${action} role: ${error.message}`)],
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
                    .setDescription('Add or remove the role')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Add', value: 'add' },
                        { name: 'Remove', value: 'remove' }
                    ))
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to modify roles for')
                    .setRequired(true))
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role to add or remove')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for the role change')
                    .setMaxLength(512))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
            .toJSON();
    }
}

export default new RoleCommand();