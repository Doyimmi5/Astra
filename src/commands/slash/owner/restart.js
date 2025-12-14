import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';

class RestartCommand extends BaseCommand {
    constructor() {
        super({
            name: 'restart',
            description: 'Restart the bot',
            category: 'owner',
            ownerOnly: true,
            cooldown: 10000
        });
    }

    async execute(interaction, client) {
        if (interaction.user.id !== process.env.OWNER_ID) {
            return interaction.reply({
                embeds: [CuteEmbedBuilder.error('Access Denied', 'Only the bot owner can use this command!')],
                ephemeral: true
            });
        }

        const embed = CuteEmbedBuilder.warning(
            '🔄 Restarting Bot',
            'Bot is restarting... I\'ll be back soon! 💖'
        );

        await interaction.reply({ embeds: [embed] });
        
        client.log('Bot restart initiated by owner', 'info');
        
        setTimeout(() => {
            process.exit(0);
        }, 2000);
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .toJSON();
    }
}

export default new RestartCommand();