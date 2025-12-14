import PrefixCommand from '../../../structures/PrefixCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import { PermissionMiddleware } from '../../../middlewares/permissions.js';
import { Validators } from '../../../helpers/validators.js';
import Case from '../../../database/schemas/Case.js';

class BanPrefixCommand extends PrefixCommand {
    constructor() {
        super({
            name: 'ban',
            description: 'Ban a user from the server',
            usage: 'ban <user> [reason]',
            aliases: ['b', 'hammer'],
            category: 'moderation',
            requiredLevel: 8
        });
    }

    async execute(message, args, client) {
        if (!args[0]) {
            return message.reply({ embeds: [CuteEmbedBuilder.error('Missing User', 'Please provide a user to ban!')] });
        }

        const userMention = args[0];
        const reason = args.slice(1).join(' ') || 'No reason provided';
        
        let user;
        try {
            const userId = userMention.replace(/[<@!>]/g, '');
            user = await client.users.fetch(userId);
        } catch {
            return message.reply({ embeds: [CuteEmbedBuilder.error('Invalid User', 'Could not find that user!')] });
        }

        if (!await PermissionMiddleware.checkSelfModeration({ user: message.author }, user)) {
            return message.reply({ embeds: [CuteEmbedBuilder.error('Self Moderation', 'You cannot ban yourself!')] });
        }

        const member = message.guild.members.cache.get(user.id);
        if (member && !await PermissionMiddleware.checkHierarchy({ user: message.author, guild: message.guild }, member)) {
            return message.reply({ embeds: [CuteEmbedBuilder.error('Hierarchy Error', 'You cannot ban someone with equal or higher roles!')] });
        }

        try {
            await message.guild.members.ban(user.id, { reason: `Banned by ${message.author.tag}: ${reason}` });

            const newCase = new Case({
                guildId: message.guild.id,
                userId: user.id,
                moderatorId: message.author.id,
                type: 'ban',
                reason: reason
            });
            await newCase.save();

            const banEmbed = CuteEmbedBuilder.moderation('ban', user, message.author, reason);
            banEmbed.addFields({ name: 'Case ID', value: newCase.caseId.slice(0, 8), inline: true });

            await message.reply({ embeds: [banEmbed] });

        } catch (error) {
            await message.reply({ embeds: [CuteEmbedBuilder.error('Ban Failed', `Failed to ban user: ${error.message}`)] });
        }
    }
}

export default new BanPrefixCommand();