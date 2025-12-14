import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

class AvatarSlashCommand extends BaseCommand {
    constructor() {
        super({
            name: 'avatar',
            description: 'Show user avatar',
            category: 'utility',
            cooldown: 2000
        });
    }

    async execute(interaction, client) {
        const user = interaction.options.getUser('user') || interaction.user;

        const avatarEmbed = CuteEmbedBuilder.info(
            `${user.tag}'s Avatar`,
            `Here's ${user.id === interaction.user.id ? 'your' : 'their'} cute avatar! 💖`
        );

        avatarEmbed.setImage(user.displayAvatarURL({ size: 512, dynamic: true }));
        avatarEmbed.addFields([
            { name: 'User', value: user.tag, inline: true },
            { name: 'ID', value: user.id, inline: true },
            { name: 'Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
        ]);

        const avatarRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Download')
                    .setStyle(ButtonStyle.Link)
                    .setURL(user.displayAvatarURL({ size: 1024, dynamic: true }))
                    .setEmoji('📥')
            );

        await interaction.reply({ embeds: [avatarEmbed], components: [avatarRow] });
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('User to show avatar for'))
            .toJSON();
    }
}

export default new AvatarSlashCommand();