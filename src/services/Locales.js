const fs = require('fs');
const path = require('path');
const Logger = require('./Logger');

class Locales {
  constructor() {
    this.languages = new Map();
  }

  load() {
    const localePath = path.join(__dirname, '../locales');
    const files = fs.readdirSync(localePath).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const lang = require(path.join(localePath, file));
      const langName = file.split('.')[0];
      this.languages.set(langName, lang);
    }
    Logger.info(`Loaded ${this.languages.size} languages.`);
  }

  get(langCode, key, args = {}) {
    const lang = this.languages.get(langCode) || this.languages.get('en');
    let str = lang[key] || key;

    // Simple interpolation
    for (const [k, v] of Object.entries(args)) {
      str = str.replace(`{{${k}}}`, v);
    }
    return str;
  }
}

module.exports = new Locales();