import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';
import fsExtra from 'fs-extra';
import klaw from 'klaw';
import AsciiTable from 'ascii-table';

export default class InteractionHandler {
    constructor(client) {
        this.client = client;
        this.interactions = new Collection();
    }

    async load() {
        const interactionsPath = path.join(process.cwd(), 'src', 'interactions');
        
        if (!fsExtra.existsSync(interactionsPath)) {
            this.client.log('Interactions directory not found, creating...', 'warn');
            fsExtra.ensureDirSync(interactionsPath);
            return;
        }

        const table = new AsciiTable('Interactions');
        table.setHeading('Interaction', 'Status', 'Type');

        let loadedCount = 0;
        let failedCount = 0;

        for await (const file of klaw(interactionsPath)) {
            if (!file.path.endsWith('.js') || file.stats.isDirectory()) continue;

            try {
                const interactionModule = await import(pathToFileURL(file.path).href);
                const interaction = interactionModule.default;

                if (!interaction || typeof interaction.execute !== 'function') {
                    table.addRow(path.basename(file.path), '❌ Invalid', 'N/A');
                    failedCount++;
                    continue;
                }

                this.client.interactions.set(interaction.customId, interaction);
                table.addRow(interaction.customId, '✅ Loaded', interaction.type || 'Button');
                loadedCount++;

            } catch (error) {
                table.addRow(path.basename(file.path), '❌ Error', 'N/A');
                this.client.log(`Failed to load interaction ${file.path}: ${error.message}`, 'error');
                failedCount++;
            }
        }

        console.log(table.toString());
        this.client.log(`Loaded ${loadedCount} interactions, ${failedCount} failed`, 'info');
    }

    async handleInteraction(interaction) {
        let customId = interaction.customId;
        
        // Handle dynamic custom IDs (e.g., "ban_123456789")
        if (customId && customId.includes('_')) {
            const baseName = customId.split('_')[0];
            const handler = this.client.interactions.get(baseName);
            if (handler) {
                return await handler.execute(interaction, this.client);
            }
        }

        const handler = this.client.interactions.get(customId);
        if (!handler) {
            this.client.log(`No handler found for interaction: ${customId}`, 'warn');
            return;
        }

        try {
            await handler.execute(interaction, this.client);
        } catch (error) {
            this.client.log(`Error executing interaction ${customId}: ${error.message}`, 'error');
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'An error occurred while processing this interaction! 💔',
                    ephemeral: true
                }).catch(() => {});
            }
        }
    }

    getInteractions() {
        return this.client.interactions;
    }
}