import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';
import fsExtra from 'fs-extra';
import klaw from 'klaw';
import AsciiTable from 'ascii-table';

import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';

export default class PrefixHandler {
    constructor(client) {
        this.client = client;
        this.prefixCommands = new Collection();
    }

    async load() {
        const commandsPath = path.join(process.cwd(), 'src', 'commands', 'prefix');
        
        if (!fsExtra.existsSync(commandsPath)) {
            this.client.log('Prefix commands directory not found, creating...', 'warn');
            fsExtra.ensureDirSync(commandsPath);
            return;
        }

        const table = new AsciiTable('Prefix Commands');
        table.setHeading('Command', 'Status', 'Category');

        let loadedCount = 0;
        let failedCount = 0;

        for await (const file of klaw(commandsPath)) {
            if (!file.path.endsWith('.js') || file.stats.isDirectory()) continue;

            try {
                const commandModule = await import(pathToFileURL(file.path).href);
                const command = commandModule.default;

                if (!command || typeof command.execute !== 'function') {
                    table.addRow(path.basename(file.path), '❌ Invalid', 'N/A');
                    failedCount++;
                    continue;
                }

                this.client.prefixCommands = this.client.prefixCommands || new Collection();
                this.client.prefixCommands.set(command.name, command);
                
                // Add aliases
                if (command.aliases) {
                    command.aliases.forEach(alias => {
                        this.client.prefixCommands.set(alias, command);
                    });
                }

                table.addRow(command.name, '✅ Loaded', command.category || 'General');
                loadedCount++;

            } catch (error) {
                table.addRow(path.basename(file.path), '❌ Error', 'N/A');
                this.client.log(`Failed to load prefix command ${file.path}: ${error.message}`, 'error');
                failedCount++;
            }
        }

        this.client.log(`Loaded ${loadedCount} prefix commands, ${failedCount} failed`, 'info');
    }

    async handleMessage(message) {
        if (message.author.bot || !message.guild) return;

        const prefix = '!'; // You can make this configurable
        const mentionPrefix = `<@${this.client.user.id}>`;
        const mentionPrefixNick = `<@!${this.client.user.id}>`;

        let usedPrefix = null;
        if (message.content.startsWith(prefix)) {
            usedPrefix = prefix;
        } else if (message.content.startsWith(mentionPrefix)) {
            usedPrefix = mentionPrefix;
        } else if (message.content.startsWith(mentionPrefixNick)) {
            usedPrefix = mentionPrefixNick;
        }

        if (!usedPrefix) return;

        const args = message.content.slice(usedPrefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = this.client.prefixCommands?.get(commandName);
        if (!command) return;

        // Check maintenance mode
        if (this.client.maintenanceMode && !command.ownerOnly) {
            return message.reply({
                embeds: [CuteEmbedBuilder.warning(
                    '🔧 Maintenance Mode',
                    `Bot is currently under maintenance.\n\n**Reason:** ${this.client.maintenanceReason || 'Scheduled maintenance'}`
                )]
            });
        }

        // Check permissions
        if (!await command.checkPermissions(message, this.client)) {
            return message.reply({
                embeds: [CuteEmbedBuilder.error('No Permission', 'You don\'t have permission to use this command!')]
            });
        }

        // Check cooldown
        const cooldownKey = `${command.name}-${message.author.id}`;
        const cooldownTime = this.client.cooldowns.get(cooldownKey);
        
        if (cooldownTime && Date.now() < cooldownTime) {
            const timeLeft = cooldownTime - Date.now();
            return message.reply({
                embeds: [CuteEmbedBuilder.warning(
                    'Cooldown Active',
                    `Please wait **${Math.ceil(timeLeft / 1000)}s** before using this command again!`
                )]
            });
        }

        this.client.cooldowns.set(cooldownKey, Date.now() + command.cooldown);

        try {
            await command.execute(message, args, this.client);
        } catch (error) {
            this.client.log(`Prefix command ${command.name} failed: ${error.message}`, 'error');
            await message.reply({
                embeds: [CuteEmbedBuilder.error('Command Error', `Failed to execute command: ${error.message}`)]
            });
        }
    }
}

