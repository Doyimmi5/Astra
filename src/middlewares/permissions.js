import { PermissionsBitField } from 'discord.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const config = JSON.parse(readFileSync(join(__dirname, '../config/config.json'), 'utf8'));
import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';
import { Validators } from '../helpers/validators.js';

export class PermissionMiddleware {
    static async checkPermissions(interaction, requiredPermissions = []) {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        
        if (!member) {
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Permission Error', 'Could not find member in guild')],
                ephemeral: true
            });
            return false;
        }

        for (const permission of requiredPermissions) {
            if (!Validators.hasPermission(member, permission)) {
                await interaction.reply({
                    embeds: [CuteEmbedBuilder.error(
                        'Insufficient Permissions',
                        `You need the \`${permission}\` permission to use this command! 💔`
                    )],
                    ephemeral: true
                });
                return false;
            }
        }

        return true;
    }

    static async checkBotPermissions(interaction, requiredPermissions = []) {
        const botMember = interaction.guild?.members.cache.get(interaction.client.user.id);
        
        if (!botMember) return false;

        for (const permission of requiredPermissions) {
            if (!Validators.hasPermission(botMember, permission)) {
                await interaction.reply({
                    embeds: [CuteEmbedBuilder.error(
                        'Bot Missing Permissions',
                        `I need the \`${permission}\` permission to execute this command! 🥺`
                    )],
                    ephemeral: true
                });
                return false;
            }
        }

        return true;
    }

    static async checkHierarchy(interaction, targetMember) {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        const botMember = interaction.guild?.members.cache.get(interaction.client.user.id);

        if (!member || !botMember || !targetMember) return false;

        if (targetMember.id === interaction.guild.ownerId) {
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error(
                    'Cannot Moderate Owner',
                    'I cannot moderate the server owner! 😅'
                )],
                ephemeral: true
            });
            return false;
        }

        if (member.roles.highest.position <= targetMember.roles.highest.position && member.id !== interaction.guild.ownerId) {
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error(
                    'Hierarchy Error',
                    'You cannot moderate someone with equal or higher roles! 💔'
                )],
                ephemeral: true
            });
            return false;
        }

        if (botMember.roles.highest.position <= targetMember.roles.highest.position) {
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error(
                    'Bot Hierarchy Error',
                    'I cannot moderate someone with equal or higher roles than me! 🥺'
                )],
                ephemeral: true
            });
            return false;
        }

        return true;
    }

    static async checkSelfModeration(interaction, targetUser) {
        if (interaction.user.id === targetUser.id) {
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error(
                    'Self Moderation',
                    'You cannot moderate yourself, silly! >.<'
                )],
                ephemeral: true
            });
            return false;
        }

        if (targetUser.id === interaction.client.user.id) {
            await interaction.reply({
                embeds: [CuteEmbedBuilder.error(
                    'Bot Moderation',
                    'You cannot moderate me! I\'m too cute for that~ 💖'
                )],
                ephemeral: true
            });
            return false;
        }

        return true;
    }
}