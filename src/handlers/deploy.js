import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { Collection } from 'discord.js';
import 'dotenv/config';
import chalk from 'chalk';
import ora from 'ora';
import { readdirSync } from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';
import klaw from 'klaw';
import AsciiTable from 'ascii-table';

class CommandDeployer {
    constructor() {
        this.rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
        this.commands = [];
        this.contexts = [];
    }

    async loadCommands() {
        const spinner = ora('Loading commands...').start();
        const commandsPath = path.join(process.cwd(), 'src', 'commands');
        
        try {
            for await (const file of klaw(commandsPath)) {
                if (!file.path.endsWith('.js') || file.stats.isDirectory()) continue;

                const commandModule = await import(pathToFileURL(file.path).href);
                const command = commandModule.default;

                if (command && typeof command.toJSON === 'function') {
                    this.commands.push(command.toJSON());
                }
            }
            
            spinner.succeed(`Loaded ${this.commands.length} commands`);
        } catch (error) {
            spinner.fail(`Failed to load commands: ${error.message}`);
            throw error;
        }
    }

    async loadContexts() {
        const spinner = ora('Loading context menus...').start();
        const contextsPath = path.join(process.cwd(), 'src', 'contexts');
        
        try {
            for await (const file of klaw(contextsPath)) {
                if (!file.path.endsWith('.js') || file.stats.isDirectory()) continue;

                const contextModule = await import(pathToFileURL(file.path).href);
                const context = contextModule.default;

                if (context && typeof context.toJSON === 'function') {
                    this.contexts.push(context.toJSON());
                }
            }
            
            spinner.succeed(`Loaded ${this.contexts.length} context menus`);
        } catch (error) {
            spinner.fail(`Failed to load context menus: ${error.message}`);
            throw error;
        }
    }

    async deployGlobal() {
        const spinner = ora('Deploying global commands...').start();
        
        try {
            const allCommands = [...this.commands, ...this.contexts];
            
            const data = await this.rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: allCommands }
            );

            spinner.succeed(`Successfully deployed ${data.length} global commands`);
            
        } catch (error) {
            spinner.fail(`Failed to deploy global commands: ${error.message}`);
            throw error;
        }
    }

    async deployGuild(guildId) {
        const spinner = ora(`Deploying guild commands to ${guildId}...`).start();
        
        try {
            const allCommands = [...this.commands, ...this.contexts];
            
            const data = await this.rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
                { body: allCommands }
            );

            spinner.succeed(`Successfully deployed ${data.length} guild commands`);
            
        } catch (error) {
            spinner.fail(`Failed to deploy guild commands: ${error.message}`);
            throw error;
        }
    }

    async deleteGlobalCommands() {
        const spinner = ora('Deleting all global commands...').start();
        
        try {
            await this.rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: [] }
            );

            spinner.succeed('Successfully deleted all global commands');
            
        } catch (error) {
            spinner.fail(`Failed to delete global commands: ${error.message}`);
            throw error;
        }
    }

    async deleteGuildCommands(guildId) {
        const spinner = ora(`Deleting guild commands from ${guildId}...`).start();
        
        try {
            await this.rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
                { body: [] }
            );

            spinner.succeed('Successfully deleted all guild commands');
            
        } catch (error) {
            spinner.fail(`Failed to delete guild commands: ${error.message}`);
            throw error;
        }
    }
}

async function main() {
    console.clear();
    console.log(chalk.magenta('🚀 Astra Command Deployer\n'));
    
    const deployer = new CommandDeployer();
    
    try {
        await deployer.loadCommands();
        await deployer.loadContexts();
        
        const args = process.argv.slice(2);
        const command = args[0];
        const guildId = args[1];
        
        switch (command) {
            case 'global':
                await deployer.deployGlobal();
                break;
                
            case 'guild':
                if (!guildId) {
                    console.log(chalk.red('❌ Guild ID required for guild deployment'));
                    process.exit(1);
                }
                await deployer.deployGuild(guildId);
                break;
                
            case 'delete-global':
                await deployer.deleteGlobalCommands();
                break;
                
            case 'delete-guild':
                if (!guildId) {
                    console.log(chalk.red('❌ Guild ID required for guild deletion'));
                    process.exit(1);
                }
                await deployer.deleteGuildCommands(guildId);
                break;
                
            default:
                console.log(chalk.yellow('Usage:'));
                console.log('  node deploy.js global');
                console.log('  node deploy.js guild <guild_id>');
                console.log('  node deploy.js delete-global');
                console.log('  node deploy.js delete-guild <guild_id>');
                break;
        }
        
        console.log(chalk.green('\n✨ Deployment complete!'));
        
    } catch (error) {
        console.error(chalk.red(`\n❌ Deployment failed: ${error.message}`));
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default CommandDeployer;