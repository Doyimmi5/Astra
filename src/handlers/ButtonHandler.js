import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';
import fsExtra from 'fs-extra';
import klaw from 'klaw';
import AsciiTable from 'ascii-table';

export default class ButtonHandler {
    constructor(client) {
        this.client = client;
        this.buttons = new Collection();
    }

    async load() {
        const buttonsPath = path.join(process.cwd(), 'src', 'buttons');
        
        if (!fsExtra.existsSync(buttonsPath)) {
            this.client.log('Buttons directory not found, creating...', 'warn');
            fsExtra.ensureDirSync(buttonsPath);
            return;
        }

        const table = new AsciiTable('Buttons');
        table.setHeading('Button', 'Status', 'Type');

        let loadedCount = 0;
        let failedCount = 0;

        for await (const file of klaw(buttonsPath)) {
            if (!file.path.endsWith('.js') || file.stats.isDirectory()) continue;

            try {
                const buttonModule = await import(pathToFileURL(file.path).href);
                const button = buttonModule.default;

                if (!button || typeof button.execute !== 'function') {
                    table.addRow(path.basename(file.path), '❌ Invalid', 'N/A');
                    failedCount++;
                    continue;
                }

                this.client.buttons = this.client.buttons || new Collection();
                this.client.buttons.set(button.customId, button);
                table.addRow(button.customId, '✅ Loaded', 'Button');
                loadedCount++;

            } catch (error) {
                table.addRow(path.basename(file.path), '❌ Error', 'N/A');
                this.client.log(`Failed to load button ${file.path}: ${error.message}`, 'error');
                failedCount++;
            }
        }

        console.log(table.toString());
        this.client.log(`Loaded ${loadedCount} buttons, ${failedCount} failed`, 'info');
    }

    async handleButton(interaction) {
        let customId = interaction.customId;
        
        // Handle dynamic custom IDs
        if (customId.includes('_')) {
            const baseName = customId.split('_')[0] + '_' + customId.split('_')[1];
            const handler = this.client.buttons?.get(baseName);
            if (handler) {
                return await handler.execute(interaction, this.client);
            }
        }

        const handler = this.client.buttons?.get(customId);
        if (!handler) {
            this.client.log(`No handler found for button: ${customId}`, 'warn');
            return;
        }

        try {
            await handler.execute(interaction, this.client);
        } catch (error) {
            this.client.log(`Error executing button ${customId}: ${error.message}`, 'error');
        }
    }
}