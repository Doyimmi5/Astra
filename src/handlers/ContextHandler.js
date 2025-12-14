import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';
import fsExtra from 'fs-extra';
import klaw from 'klaw';
import AsciiTable from 'ascii-table';

export default class ContextHandler {
    constructor(client) {
        this.client = client;
        this.contexts = new Collection();
    }

    async load() {
        const contextsPath = path.join(process.cwd(), 'src', 'contexts');
        
        if (!fsExtra.existsSync(contextsPath)) {
            this.client.log('Contexts directory not found, creating...', 'warn');
            fsExtra.ensureDirSync(contextsPath);
            return;
        }

        const table = new AsciiTable('Context Menus');
        table.setHeading('Context', 'Status', 'Type');

        let loadedCount = 0;
        let failedCount = 0;

        for await (const file of klaw(contextsPath)) {
            if (!file.path.endsWith('.js') || file.stats.isDirectory()) continue;

            try {
                const contextModule = await import(pathToFileURL(file.path).href);
                const context = contextModule.default;

                if (!context || typeof context.execute !== 'function') {
                    table.addRow(path.basename(file.path), '❌ Invalid', 'N/A');
                    failedCount++;
                    continue;
                }

                this.client.contexts.set(context.name, context);
                table.addRow(context.name, '✅ Loaded', context.type || 'User');
                loadedCount++;

            } catch (error) {
                table.addRow(path.basename(file.path), '❌ Error', 'N/A');
                this.client.log(`Failed to load context ${file.path}: ${error.message}`, 'error');
                failedCount++;
            }
        }

        console.log(table.toString());
        this.client.log(`Loaded ${loadedCount} context menus, ${failedCount} failed`, 'info');
    }

    async handleContext(interaction) {
        const context = this.client.contexts.get(interaction.commandName);
        
        if (!context) {
            this.client.log(`No context handler found for: ${interaction.commandName}`, 'warn');
            return;
        }

        try {
            await context.execute(interaction, this.client);
        } catch (error) {
            this.client.log(`Error executing context ${interaction.commandName}: ${error.message}`, 'error');
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'An error occurred while processing this context menu! 💔',
                    ephemeral: true
                }).catch(() => {});
            }
        }
    }

    getContexts() {
        return this.client.contexts;
    }
}