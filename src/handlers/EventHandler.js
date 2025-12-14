const { glob } = require('glob');
const Logger = require('../services/Logger');

module.exports = async (client) => {
  const eventFiles = await glob(`${process.cwd()}/src/events/*.js`);
  
  eventFiles.forEach((file) => {
    const event = require(file);
    if (event.name) {
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
    }
  });
  
  Logger.info(`Loaded ${eventFiles.length} events.`);
};