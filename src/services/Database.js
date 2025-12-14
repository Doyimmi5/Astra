const mongoose = require('mongoose');
const Logger = require('./Logger');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect(uri) {
    try {
      this.connection = await mongoose.connect(uri);
      Logger.success('Connected to MongoDB');
    } catch (error) {
      Logger.error('MongoDB connection failed', error);
      process.exit(1);
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      Logger.info('MongoDB disconnected');
    }
  }
}

module.exports = new Database();