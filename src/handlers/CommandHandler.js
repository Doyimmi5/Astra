const { glob } = require('glob');
const path = require('path');
const Logger = require('../services/Logger');

module.exports = async (client) => {
  // 1. Prefix Commands
  const prefixFiles = await glob(`${process.cwd()}/src/commands/prefix/**/*.js`);
  prefixFiles.forEach((file) => {
    const command = require(file);
    if (command.name) {
      client.prefixCommands.set(command.name, command);
      if (command.aliases && Array.isArray(command.aliases)) {
        command.aliases.forEach(alias => client.aliases.set(alias, command.name));
      }
    }
  });

  // 2. Slash Commands
  const slashFiles = await glob(`${process.cwd()}/src/commands/slash/**/*.js`);
  slashFiles.forEach((file) => {
    const command = require(file);
    if (command.data) {
      client.slashCommands.set(command.data.name, command);
    }
  });

  // 3. Context Menu Commands
  const contextFiles = await glob(`${process.cwd()}/src/commands/context/**/*.js`);
  contextFiles.forEach((file) => {
    const command = require(file);
    if (command.data) {
      client.contextCommands.set(command.data.name, command);
    }
  });

  Logger.info(`Loaded ${client.prefixCommands.size} prefix, ${client.slashCommands.size} slash, ${client.contextCommands.size} context commands.`);
};