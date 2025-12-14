import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';

class ServerInfoCommand extends BaseCommand {
    constructor() {
        super({
            name: 'serverinfo',
            description: 'Get detailed information about the server',
            category: 'utility',
            cooldown: 5000
        });
    }

    async execute(interaction, client) {
        const guild = interaction.guild;
        
        const embed = CuteEmbedBuilder.info(
            `📊 ${guild.name} Server Information`,
            `Detailed statistics for this adorable server! 🌸`
        );

        embed.setThumbnail(guild.iconURL({ dynamic: true, size: 256 }));
        
        embed.addFields([
            { name: '🆔 Server ID', value: guild.id, inline: true },
            { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
            { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
            { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
            { name: '📝 Channels', value: `${guild.channels.cache.size}`, inline: true },
            { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
            { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
            { name: '🔒 Verification', value: guild.verificationLevel.toString(), inline: true },
            { name: '🌟 Boosts', value: `${guild.premiumSubscriptionCount || 0} (Level ${guild.premiumTier})`, inline: true }
        ]);

        if (guild.description) {
            embed.addFields({ name: '📋 Description', value: guild.description, inline: false });
        }

        await interaction.reply({ embeds: [embed] });
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .toJSON();
    }
}

export default new ServerInfoCommand();