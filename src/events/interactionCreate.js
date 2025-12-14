import BaseEvent from '../structures/BaseEvent.js';
import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';
import { CooldownMiddleware } from '../middlewares/cooldown.js';

class InteractionCreateEvent extends BaseEvent {
    constructor() {
        super({
            name: 'interactionCreate',
            once: false
        });
    }

    async execute(client, interaction) {
        try {
            if (interaction.isChatInputCommand()) {
                await this.handleSlashCommand(client, interaction);
            } else if (interaction.isButton()) {
                await this.handleButton(client, interaction);
            } else if (interaction.isStringSelectMenu()) {
                await this.handleSelectMenu(client, interaction);
            } else if (interaction.isModalSubmit()) {
                await this.handleModal(client, interaction);
            } else if (interaction.isContextMenuCommand()) {
                await this.handleContext(client, interaction);
            }
        } catch (error) {
            client.log(`Error handling interaction: ${error.message}`, 'error');
            
            const errorEmbed = CuteEmbedBuilder.error(
                'Interaction Error',
                'Something went wrong while processing your request! 💔'
            );
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
            } else if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] }).catch(() => {});
            }
        }
    }

    async handleSlashCommand(client, interaction) {
        const command = client.commands.get(interaction.commandName);
        
        if (!command) {
            client.log(`Unknown command: ${interaction.commandName}`, 'warn');
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Unknown Command', 'This command doesn\'t exist!')],
                ephemeral: true
            });
        }

        // Global cooldown check
        if (!await CooldownMiddleware.checkGlobalCooldown(interaction, client)) {
            return;
        }

        // Permission checks
        const permissionCheck = await command.checkPermissions(interaction, client);
        if (!permissionCheck.success) {
            return await interaction.reply({
                embeds: [CuteEmbedBuilder.error('Permission Denied', permissionCheck.message)],
                ephemeral: true
            });
        }

        // Execute command
        try {
            await command.execute(interaction, client);
            client.log(`${interaction.user.tag} used /${interaction.commandName} in ${interaction.guild?.name || 'DM'}`, 'debug');
        } catch (error) {
            client.log(`Command ${interaction.commandName} failed: ${error.message}`, 'error');
            
            const errorEmbed = CuteEmbedBuilder.error(
                'Command Error',
                `Failed to execute command: ${error.message}`
            );
            
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                } else if (interaction.deferred) {
                    await interaction.editReply({ embeds: [errorEmbed] });
                }
            } catch (replyError) {
                client.log(`Failed to send error message: ${replyError.message}`, 'error');
            }
        }
    }
    
    async handleButton(client, interaction) {
        const button = client.buttons.get(interaction.customId.split('_')[0]);
        if (button) {
            await button.execute(interaction, client);
        } else {
            // Try interactions handler
            const interactionHandler = client.interactions.get(interaction.customId.split('_')[0]);
            if (interactionHandler) {
                await interactionHandler.execute(interaction, client);
            }
        }
    }
    
    async handleSelectMenu(client, interaction) {
        const menu = client.interactions.get(interaction.customId);
        if (menu) {
            await menu.execute(interaction, client);
        }
    }
    
    async handleModal(client, interaction) {
        const modal = client.modals.get(interaction.customId);
        if (modal) {
            await modal.execute(interaction, client);
        }
    }
    
    async handleContext(client, interaction) {
        const context = client.contexts.get(interaction.commandName);
        if (context) {
            await context.execute(interaction, client);
        }
    }
}

export default new InteractionCreateEvent();