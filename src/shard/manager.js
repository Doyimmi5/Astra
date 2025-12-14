import { ShardingManager } from 'discord.js';
import 'dotenv/config';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import ora from 'ora';
import { createServer } from 'http';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const server = createServer(app);

class ShardManager {
    constructor() {
        this.manager = new ShardingManager('./bot.js', {
            token: process.env.TOKEN,
            totalShards: process.env.SHARD_COUNT === 'auto' ? 'auto' : parseInt(process.env.SHARD_COUNT) || 'auto',
            shardList: 'auto',
            mode: 'process',
            respawn: true
        });

        this.setupEvents();
        this.setupAPI();
    }

    setupEvents() {
        this.manager.on('shardCreate', (shard) => {
            const spinner = ora(`Launching shard ${shard.id}`).start();
            
            shard.on('ready', () => {
                spinner.succeed(chalk.green(`Shard ${shard.id} is ready! 💖`));
            });

            shard.on('error', (error) => {
                spinner.fail(chalk.red(`Shard ${shard.id} error: ${error.message}`));
            });

            shard.on('death', () => {
                console.log(chalk.red(`💔 Shard ${shard.id} died`));
            });

            shard.on('reconnecting', () => {
                console.log(chalk.yellow(`🔄 Shard ${shard.id} reconnecting...`));
            });
        });
    }

    setupAPI() {
        app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                shards: this.manager.shards.size,
                uptime: process.uptime(),
                memory: process.memoryUsage()
            });
        });

        app.get('/shards', (req, res) => {
            const shardData = this.manager.shards.map(shard => ({
                id: shard.id,
                ready: shard.ready,
                status: shard.process?.killed ? 'dead' : 'alive'
            }));
            
            res.json({ shards: shardData });
        });

        server.listen(process.env.PORT || 3000, () => {
            console.log(chalk.blue(`🌐 Shard manager API listening on port ${process.env.PORT || 3000}`));
        });
    }

    async start() {
        console.clear();
        
        const title = figlet.textSync('Shard Manager', { font: 'ANSI Shadow' });
        console.log(gradient.pastel(title));
        
        console.log(chalk.magenta('🚀 Starting shard manager...'));
        
        try {
            await this.manager.spawn();
            console.log(chalk.green('✨ All shards spawned successfully!'));
        } catch (error) {
            console.error(chalk.red(`Failed to spawn shards: ${error.message}`));
            process.exit(1);
        }
    }

    async broadcastEval(script) {
        return await this.manager.broadcastEval(script);
    }

    async fetchClientValues(prop) {
        return await this.manager.fetchClientValues(prop);
    }
}

const shardManager = new ShardManager();
shardManager.start();

export default ShardManager;