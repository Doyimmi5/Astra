import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';
import fsExtra from 'fs-extra';
import klaw from 'klaw';
import AsciiTable from 'ascii-table';

export default class ModalHandler {
    constructor(client) {
        this.client = client;
        this.modals = new Collection();
    }

    async load() {
        const modalsPath = path.join(process.cwd(), 'src', 'modals');
        
        if (!fsExtra.existsSync(modalsPath)) {
            this.client.log('Modals directory not found, creating...', 'warn');
            fsExtra.ensureDirSync(modalsPath);
            return;
        }

        const table = new AsciiTable('Modals');
        table.setHeading('Modal', 'Status', 'Type');

        let loadedCount = 0;
        let failedCount = 0;

        for await (const file of klaw(modalsPath)) {
            if (!file.path.endsWith('.js') || file.stats.isDirectory()) continue;

            try {
                const modalModule = await import(pathToFileURL(file.path).href);
                const modal = modalModule.default;

                if (!modal || typeof modal.execute !== 'function') {
                    table.addRow(path.basename(file.path), '❌ Invalid', 'N/A');
                    failedCount++;
                    continue;
                }

                this.client.modals = this.client.modals || new Collection();
                this.client.modals.set(modal.customId, modal);
                table.addRow(modal.customId, '✅ Loaded', 'Modal');
                loadedCount++;

            } catch (error) {
                table.addRow(path.basename(file.path), '❌ Error', 'N/A');
                this.client.log(`Failed to load modal ${file.path}: ${error.message}`, 'error');
                failedCount++;
            }
        }

        console.log(table.toString());
        this.client.log(`Loaded ${loadedCount} modals, ${failedCount} failed`, 'info');
    }

    async handleModal(interaction) {
        let customId = interaction.customId;
        
        // Handle dynamic custom IDs
        if (customId.includes('_')) {
            const baseName = customId.split('_')[0] + '_' + customId.split('_')[1];
            const handler = this.client.modals?.get(baseName);
            if (handler) {
                return await handler.execute(interaction, this.client);
            }
        }

        const handler = this.client.modals?.get(customId);
        if (!handler) {
            this.client.log(`No handler found for modal: ${customId}`, 'warn');
            return;
        }

        try {
            await handler.execute(interaction, this.client);
        } catch (error) {
            this.client.log(`Error executing modal ${customId}: ${error.message}`, 'error');
        }
    }
}