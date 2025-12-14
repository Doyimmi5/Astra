import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';
import fsExtra from 'fs-extra';
import klaw from 'klaw';
import AsciiTable from 'ascii-table';

export default class CommandHandler {
    constructor(client) {
        this.client = client;
        this.commands = new Collection();
    }

    async load() {
        const commandsPath = path.join(process.cwd(), 'src', 'commands');
        
        if (!fsExtra.existsSync(commandsPath)) {
            this.client.log('Commands directory not found, creating...', 'warn');
            fsExtra.ensureDirSync(commandsPath);
            return;
        }

        const table = new AsciiTable('Commands');
        table.setHeading('Command', 'Status', 'Category');

        let loadedCount = 0;
        let failedCount = 0;

        for await (const file of klaw(commandsPath)) {
            if (!file.path.endsWith('.js') || file.stats.isDirectory()) continue;
            
            // Skip prefix commands in this handler
            if (file.path.includes('/prefix/')) continue;

            try {
                const commandModule = await import(pathToFileURL(file.path).href);
                const command = commandModule.default;

                if (!command || typeof command.execute !== 'function') {
                    table.addRow(path.basename(file.path), '❌ Invalid', 'N/A');
                    failedCount++;
                    continue;
                }

                this.client.commands.set(command.name, command);
                table.addRow(command.name, '✅ Loaded', command.category || 'General');
                loadedCount++;

            } catch (error) {
                table.addRow(path.basename(file.path), '❌ Error', 'N/A');
                this.client.log(`Failed to load command ${file.path}: ${error.message}`, 'error');
                failedCount++;
            }
        }

        this.client.log(`Loaded ${loadedCount} commands, ${failedCount} failed`, 'info');
    }

    async reload(commandName) {
        const command = this.client.commands.get(commandName);
        if (!command) return false;

        try {
            delete require.cache[require.resolve(`../commands/${command.category}/${commandName}.js`)];
            const newCommand = require(`../commands/${command.category}/${commandName}.js`);
            
            this.client.commands.set(commandName, newCommand);
            this.client.log(`Reloaded command: ${commandName}`, 'success');
            return true;
        } catch (error) {
            this.client.log(`Failed to reload command ${commandName}: ${error.message}`, 'error');
            return false;
        }
    }

    getCommands() {
        return this.client.commands;
    }

    getCommandsByCategory(category) {
        return this.client.commands.filter(cmd => cmd.category === category);
    }
}