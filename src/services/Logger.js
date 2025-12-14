const moment = require('moment'); // You might want to install moment or use generic Date

class Logger {
  static timestamp() {
    return new Date().toISOString();
  }

  static info(message) {
    console.log(`[${this.timestamp()}] [INFO] ${message}`);
  }

  static warn(message) {
    console.warn(`[${this.timestamp()}] [WARN] ${message}`);
  }

  static error(message, error) {
    console.error(`[${this.timestamp()}] [ERROR] ${message}`);
    if (error) console.error(error);
  }

  static success(message) {
    console.log(`[${this.timestamp()}] [SUCCESS] ${message}`);
  }
}

module.exports = Logger;