import PrefixCommand from '../../../structures/PrefixCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

class AvatarCommand extends PrefixCommand {
    constructor() {
        super({
            name: 'avatar',
            description: 'Show user avatar',
            usage: 'avatar [user]',
            aliases: ['av', 'pfp', 'profile'],
            category: 'utility'
        });
    }

    async execute(message, args, client) {
        let user = message.author;
        
        if (args[0]) {
            try {
                const userId = args[0].replace(/[<@!>]/g, '');
                user = await client.users.fetch(userId);
            } catch {
                return message.reply({ embeds: [CuteEmbedBuilder.error('Invalid User', 'Could not find that user!')] });
            }
        }

        const avatarEmbed = CuteEmbedBuilder.info(
            `${user.tag}'s Avatar`,
            `Here's ${user.id === message.author.id ? 'your' : 'their'} cute avatar! 💖`
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

        await message.reply({ embeds: [avatarEmbed], components: [avatarRow] });
    }
}

export default new AvatarCommand();