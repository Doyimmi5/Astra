import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';
import fsExtra from 'fs-extra';
import klaw from 'klaw';
import AsciiTable from 'ascii-table';

export default class EventHandler {
    constructor(client) {
        this.client = client;
        this.events = new Collection();
    }

    async load() {
        const eventsPath = path.join(process.cwd(), 'src', 'events');
        
        if (!fsExtra.existsSync(eventsPath)) {
            this.client.log('Events directory not found, creating...', 'warn');
            fsExtra.ensureDirSync(eventsPath);
            return;
        }

        const table = new AsciiTable('Events');
        table.setHeading('Event', 'Status', 'Type');

        let loadedCount = 0;
        let failedCount = 0;

        for await (const file of klaw(eventsPath)) {
            if (!file.path.endsWith('.js') || file.stats.isDirectory()) continue;

            try {
                const eventModule = await import(pathToFileURL(file.path).href);
                const event = eventModule.default;

                if (!event || typeof event.execute !== 'function') {
                    table.addRow(path.basename(file.path), '❌ Invalid', 'N/A');
                    failedCount++;
                    continue;
                }

                this.client.events.set(event.name, event);

                if (event.once) {
                    this.client.once(event.name, (...args) => event.handle(this.client, ...args));
                } else {
                    this.client.on(event.name, (...args) => event.handle(this.client, ...args));
                }

                table.addRow(event.name, '✅ Loaded', event.once ? 'Once' : 'On');
                loadedCount++;

            } catch (error) {
                table.addRow(path.basename(file.path), '❌ Error', 'N/A');
                this.client.log(`Failed to load event ${file.path}: ${error.message}`, 'error');
                failedCount++;
            }
        }

        this.client.log(`Loaded ${loadedCount} events, ${failedCount} failed`, 'info');
    }

    async reload(eventName) {
        const event = this.client.events.get(eventName);
        if (!event) return false;

        try {
            this.client.removeAllListeners(eventName);
            
            delete require.cache[require.resolve(`../events/${eventName}.js`)];
            const newEvent = require(`../events/${eventName}.js`);
            
            this.client.events.set(eventName, newEvent);
            
            if (newEvent.once) {
                this.client.once(eventName, (...args) => newEvent.handle(this.client, ...args));
            } else {
                this.client.on(eventName, (...args) => newEvent.handle(this.client, ...args));
            }
            
            this.client.log(`Reloaded event: ${eventName}`, 'success');
            return true;
        } catch (error) {
            this.client.log(`Failed to reload event ${eventName}: ${error.message}`, 'error');
            return false;
        }
    }

    getEvents() {
        return this.client.events;
    }
}