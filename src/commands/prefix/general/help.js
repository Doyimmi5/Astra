import PrefixCommand from '../../../structures/PrefixCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import { PermissionChecker } from '../../../helpers/permissionChecker.js';
import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

class HelpCommand extends PrefixCommand {
    constructor() {
        super({
            name: 'help',
            description: 'Show bot commands and information',
            usage: 'help [command]',
            aliases: ['h', 'commands', 'cmd'],
            category: 'general'
        });
    }

    async execute(message, args, client) {
        if (args[0]) {
            return this.showCommandHelp(message, args[0], client);
        }

        const userLevel = PermissionChecker.getUserLevel(message.author, message.guild);
        
        const categories = {
            '🌸 General': 'Basic bot commands',
            '🔨 Moderation': 'Server moderation tools',
            '⚙️ Utility': 'Helpful utility commands',
            '👑 Admin': 'Administrator commands',
            '🔧 Owner': 'Bot owner commands'
        };

        const helpEmbed = CuteEmbedBuilder.info(
            '💖 Astra Help Menu',
            `Hello ${message.author}! I'm your cute moderation assistant~\n\n**Your Level:** ${userLevel.role} (${userLevel.level})`
        );

        helpEmbed.addFields([
            { name: '📚 Categories', value: Object.entries(categories).map(([cat, desc]) => `${cat}: ${desc}`).join('\n'), inline: false },
            { name: '🎯 Quick Commands', value: '`ping` • `uptime` • `stats` • `info`', inline: false },
            { name: '💡 Tips', value: 'Use the dropdown below to explore categories!\nPrefix: `!` or mention me', inline: false }
        ]);

        const selectMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('help_category')
                    .setPlaceholder('Select a category to explore...')
                    .addOptions([
                        { label: 'General Commands', value: 'general', emoji: '🌸' },
                        { label: 'Moderation', value: 'moderation', emoji: '🔨' },
                        { label: 'Utility', value: 'utility', emoji: '⚙️' },
                        { label: 'Admin Commands', value: 'admin', emoji: '👑' },
                        { label: 'Owner Commands', value: 'owner', emoji: '🔧' }
                    ])
            );

        await message.reply({ embeds: [helpEmbed], components: [selectMenu] });
    }

    async showCommandHelp(message, commandName, client) {
        const command = client.commands.get(commandName) || 
                      client.commands.find(cmd => cmd.aliases?.includes(commandName));

        if (!command) {
            return message.reply({ embeds: [CuteEmbedBuilder.error('Command Not Found', `No command found with name \`${commandName}\``)] });
        }

        const helpEmbed = CuteEmbedBuilder.info(
            `Command: ${command.name}`,
            command.description || 'No description available'
        );

        helpEmbed.addFields([
            { name: 'Usage', value: `\`${command.usage || command.name}\``, inline: true },
            { name: 'Category', value: command.category || 'Unknown', inline: true },
            { name: 'Aliases', value: command.aliases?.join(', ') || 'None', inline: true }
        ]);

        if (command.requiredLevel > 0) {
            helpEmbed.addFields({ name: 'Required Level', value: command.requiredLevel.toString(), inline: true });
        }

        await message.reply({ embeds: [helpEmbed] });
    }
}

export default new HelpCommand();