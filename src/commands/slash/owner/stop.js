import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';

class StopCommand extends BaseCommand {
    constructor() {
        super({
            name: 'stop',
            description: 'Stop the bot',
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
            '⛔ Stopping Bot',
            'Bot is shutting down... Goodbye! 💔'
        );

        await interaction.reply({ embeds: [embed] });
        
        client.log('Bot shutdown initiated by owner', 'info');
        
        setTimeout(async () => {
            await client.destroy();
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

export default new StopCommand();