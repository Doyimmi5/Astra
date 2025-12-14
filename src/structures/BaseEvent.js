import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import moment from 'moment';
import crypto from 'crypto';

export default class BaseEvent {
    constructor(options = {}) {
        this.name = options.name || 'unknown';
        this.once = options.once || false;
        this.enabled = options.enabled !== false;
        this.id = uuidv4();
        this.createdAt = dayjs().format();
        this.timestamp = moment().unix();
        this.hash = crypto.createHash('sha256').update(this.name).digest('hex');
    }

    async execute(...args) {
        throw new Error(`Event ${this.name} doesn't have an execute method!`);
    }

    async handle(client, ...args) {
        try {
            if (!this.enabled) return;
            
            client.log(`🌸 Event ${this.name} triggered`, 'debug');
            await this.execute(client, ...args);
        } catch (error) {
            client.log(`Error in event ${this.name}: ${error.message}`, 'error');
        }
    }
}