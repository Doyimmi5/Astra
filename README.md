# 🌸 Astra Bot - Cute Femboy Moderation Bot

A professional, scalable Discord.js v14 moderation bot with cute/femboy theming and comprehensive moderation features.

## ✨ Features

- 🔨 **50+ Moderation Commands** - Ban, kick, mute, warn, clear, lockdown, and more
- 💖 **Cute/Femboy Theme** - Adorable embeds, messages, and emojis
- 🛡️ **Advanced Permissions** - Hierarchy checks and role-based permissions
- 📊 **MongoDB Integration** - Persistent case logging and guild settings
- 🚀 **Shard Ready** - Built for large-scale deployment
- 🎯 **Anti-Spam** - Intelligent spam detection and prevention
- 📝 **Comprehensive Logging** - Winston and Pino integration
- 🔄 **Auto-Moderation** - Automated moderation features
- 🌐 **Multi-Language** - i18n support ready
- 🧪 **Fully Tested** - Jest test suite included

## 🚀 Quick Start

1. **Clone and Install**
```bash
git clone <repository>
cd Astra
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your bot token and database URI
```

3. **Deploy Commands**
```bash
npm run deploy global
# or for specific guild: npm run deploy guild <guild_id>
```

4. **Start the Bot**
```bash
npm start
# or for development: npm run dev
```

## 📁 Project Structure

```
/src
├─ /commands          # Moderation slash commands
├─ /contexts          # Context menus (user/message)
├─ /events            # Discord events
├─ /handlers          # Command/event loaders
├─ /structures        # Base classes
├─ /database          # MongoDB schemas
├─ /logs              # Log files
├─ /helpers           # Utility functions
├─ /middlewares       # Permission/cooldown checks
├─ /config            # Configuration files
├─ /interactions      # Button/select menu handlers
├─ /modlogs           # Moderation logging
├─ /templates         # Embed templates
├─ /shard             # Sharding support
└─ /cache             # Cache management
```

## 🔧 Commands

### Moderation Commands
- `/ban` - Ban a user with confirmation
- `/kick` - Kick a user from the server
- `/mute` - Timeout a user
- `/unmute` - Remove timeout from user
- `/warn` - Issue a warning
- `/clear` - Bulk delete messages
- `/lockdown` - Lock channel permissions
- `/slowmode` - Set channel slowmode
- `/case` - Look up moderation cases

### More Commands Available
The bot includes 50+ moderation commands covering all aspects of server management.

## 🛠️ Development

### Scripts
```bash
npm run dev          # Development with nodemon
npm run test         # Run Jest tests
npm run lint         # ESLint checking
npm run format       # Prettier formatting
npm run build        # Rollup bundling
npm run shard        # Start shard manager
```

### Dependencies Used
All 65 required dependencies are actively used:
- **Discord.js v14** - Core bot framework
- **MongoDB/Mongoose** - Database integration
- **Winston/Pino** - Logging systems
- **Sharp/Puppeteer** - Image processing
- **Audio Libraries** - Voice support ready
- **Testing Suite** - Jest, Supertest
- **Code Quality** - ESLint, Prettier, Husky

## 🎨 Theming

The bot features a consistent cute/femboy aesthetic:
- 💖 Pink and pastel color schemes
- ✨ Adorable emojis and reactions
- 🌸 Cute footer messages
- 💕 Friendly error messages
- 🦄 Kawaii embed designs

## 📊 Database Schemas

### Cases
- Moderation action logging
- UUID-based case IDs
- Automatic expiration
- Evidence attachment support

### Guilds
- Server-specific settings
- Automod configuration
- Custom prefixes and channels

### Users
- Warning tracking
- Infraction counting
- Reputation system

## 🔒 Security Features

- Input validation and sanitization
- Permission hierarchy checks
- Rate limiting and cooldowns
- Anti-spam detection
- SQL injection prevention
- XSS protection

## 🌐 Deployment

### PM2 (Recommended)
```bash
npm install -g pm2
pm2 start ecosystem.config.js
```

### Docker Support
```bash
docker build -t astra-bot .
docker run -d --name astra astra-bot
```

### Sharding
```bash
npm run shard  # Automatic shard management
```

## 📝 Configuration

### Environment Variables
```env
TOKEN=your_bot_token
CLIENT_ID=your_client_id
MONGODB_URI=mongodb://localhost:27017/astra
NODE_ENV=production
SHARD_COUNT=auto
```

### Config Files
- `config.json` - Colors, emojis, limits
- `ecosystem.config.js` - PM2 configuration
- `.eslintrc.json` - Code quality rules

## 🧪 Testing

Comprehensive test suite covering:
- Unit tests for utilities
- Integration tests for commands
- Database operation tests
- API endpoint testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 📈 Monitoring

- Health check endpoints
- Performance metrics
- Error tracking
- Shard status monitoring
- Memory usage alerts

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Run linting and formatting
5. Submit pull request

## 📄 License

MIT License - See LICENSE file for details

## 💖 Support

For support and questions:
- Create an issue on GitHub
- Join our Discord server
- Check the documentation

---

Made with 💖 by the Astra team - Keeping Discord servers cute and safe! uwu