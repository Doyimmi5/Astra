import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';

class LogsCommand extends BaseCommand {
    constructor() {
        super({
            name: 'logs',
            description: 'Setup logging channels',
            category: 'admin',
            permissions: [PermissionFlagsBits.ManageChannels],
            cooldown: 3000
        });
    }

    async execute(interaction, client) {
        const type = interaction.options.getString('type');
        const channel = interaction.options.getChannel('channel');

        const embed = CuteEmbedBuilder.success(
            '📊 Logs Setup',
            `${type} logs will now be sent to ${channel}! ✨`
        );

        await interaction.reply({ embeds: [embed] });
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('type')
                    .setDescription('Type of logs')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Messages', value: 'messages' },
                        { name: 'Members', value: 'members' },
                        { name: 'Moderation', value: 'moderation' },
                        { name: 'Server', value: 'server' }
                    ))
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('Channel for logs')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
            .toJSON();
    }
}

export default new LogsCommand();