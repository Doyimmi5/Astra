import mongoose from 'mongoose';
import chalk from 'chalk';
import ora from 'ora';

export default class Database {
    constructor(client) {
        this.client = client;
        this.connection = null;
        this.spinner = ora('Connecting to MongoDB...');
    }

    async connect() {
        try {
            this.spinner.start();
            
            this.connection = await mongoose.connect(process.env.MONGODB_URI);
            
            this.spinner.succeed('Connected to MongoDB! 💖');
            this.client.log('MongoDB connection established', 'success', 'DATABASE');
            
            mongoose.connection.on('error', (err) => {
                this.client.log(`MongoDB error: ${err.message}`, 'error', 'DATABASE');
            });

            mongoose.connection.on('disconnected', () => {
                this.client.log('MongoDB disconnected', 'warn', 'DATABASE');
            });

            mongoose.connection.on('reconnected', () => {
                this.client.log('MongoDB reconnected', 'success', 'DATABASE');
            });

        } catch (error) {
            this.spinner.fail('Failed to connect to MongoDB');
            this.client.log(`MongoDB connection failed: ${error.message}`, 'error', 'DATABASE');
            process.exit(1);
        }
    }

    async disconnect() {
        if (this.connection) {
            await mongoose.disconnect();
            this.client.log('MongoDB disconnected gracefully', 'info', 'DATABASE');
        }
    }
}