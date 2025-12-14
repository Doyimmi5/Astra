import { EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const config = JSON.parse(readFileSync(join(__dirname, '../config/config.json'), 'utf8'));
import tinycolor from 'tinycolor2';
import _ from 'lodash';

export class EmbedTemplates {
    static moderationLog(action, target, moderator, reason, additional = {}) {
        const color = tinycolor(config.colors[action] || config.colors.primary).toHexString();
        const emoji = config.emojis[action] || '⚡';
        
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`${emoji} ${_.capitalize(action)} | ${target.tag}`)
            .setThumbnail(target.displayAvatarURL())
            .addFields([
                { name: '👤 User', value: `${target.tag} (${target.id})`, inline: true },
                { name: '🛡️ Moderator', value: `${moderator.tag} (${moderator.id})`, inline: true },
                { name: '📝 Reason', value: reason || 'No reason provided', inline: false }
            ])
            .setFooter({ text: _.sample(config.footers) })
            .setTimestamp();

        if (additional.duration) {
            embed.addFields({ name: '⏰ Duration', value: additional.duration, inline: true });
        }

        if (additional.caseId) {
            embed.addFields({ name: '🆔 Case ID', value: additional.caseId, inline: true });
        }

        return embed;
    }

    static welcomeMessage(member, guild) {
        const welcomeMessages = [
            `Welcome to our cute server, ${member}! 💖`,
            `A wild cutie appeared! Welcome ${member}! ✨`,
            `${member} just joined the party! 🎉`,
            `Look who decided to join us! Welcome ${member}! 🌸`,
            `${member} has entered the chat! Everyone say hi! 👋`
        ];

        return new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('💖 Welcome to the Server!')
            .setDescription(_.sample(welcomeMessages))
            .setThumbnail(member.user.displayAvatarURL())
            .addFields([
                { name: '👤 Member', value: member.user.tag, inline: true },
                { name: '📊 Member Count', value: guild.memberCount.toString(), inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
            ])
            .setFooter({ text: 'We hope you enjoy your stay! uwu' })
            .setTimestamp();
    }

    static leaveMessage(user, guild) {
        const leaveMessages = [
            `${user.tag} has left the server 💔`,
            `Goodbye ${user.tag}! We'll miss you! 🥺`,
            `${user.tag} decided to leave us... 😢`,
            `Another one bites the dust... Bye ${user.tag}! 👋`,
            `${user.tag} has left the building! 🚪`
        ];

        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setTitle('💔 Member Left')
            .setDescription(_.sample(leaveMessages))
            .setThumbnail(user.displayAvatarURL())
            .addFields([
                { name: '👤 User', value: user.tag, inline: true },
                { name: '📊 Member Count', value: guild.memberCount.toString(), inline: true }
            ])
            .setFooter({ text: 'Hope to see you again soon!' })
            .setTimestamp();
    }

    static autoModAlert(type, user, channel, details) {
        const colors = {
            spam: config.colors.warning,
            raid: config.colors.error,
            toxicity: config.colors.error,
            caps: config.colors.warning
        };

        return new EmbedBuilder()
            .setColor(colors[type] || config.colors.warning)
            .setTitle(`🤖 AutoMod Alert: ${_.capitalize(type)}`)
            .setDescription(`Automatic moderation action taken against ${user}`)
            .addFields([
                { name: '👤 User', value: `${user.tag} (${user.id})`, inline: true },
                { name: '📍 Channel', value: channel.toString(), inline: true },
                { name: '⚡ Action', value: details.action || 'Message deleted', inline: true },
                { name: '📝 Details', value: details.reason || 'Automated detection', inline: false }
            ])
            .setThumbnail(user.displayAvatarURL())
            .setFooter({ text: 'AutoMod by Astra 🤖' })
            .setTimestamp();
    }

    static serverStats(guild) {
        const onlineMembers = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;
        const botCount = guild.members.cache.filter(m => m.user.bot).size;
        const humanCount = guild.memberCount - botCount;

        return new EmbedBuilder()
            .setColor(config.colors.info)
            .setTitle(`📊 ${guild.name} Statistics`)
            .setThumbnail(guild.iconURL())
            .addFields([
                { name: '👥 Total Members', value: guild.memberCount.toString(), inline: true },
                { name: '👤 Humans', value: humanCount.toString(), inline: true },
                { name: '🤖 Bots', value: botCount.toString(), inline: true },
                { name: '🟢 Online', value: onlineMembers.toString(), inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true }
            ])
            .setFooter({ text: _.sample(config.footers) })
            .setTimestamp();
    }
}

export default EmbedTemplates;