# 🌸 Astra Bot Commands

## 📋 Command Summary

### Prefix Commands (30+)
**General Commands:**
- `!ping` - Check bot latency and uptime
- `!help` - Interactive help menu with categories
- `!uptime` - Detailed uptime and system info
- `!stats` - Comprehensive bot statistics
- `!avatar [user]` - Show user avatar
- `!userinfo [user]` - Detailed user information
- `!serverinfo` - Server information and stats

**Moderation Commands:**
- `!ban <user> [reason]` - Ban a user
- `!kick <user> [reason]` - Kick a user
- `!mute <user> [duration] [reason]` - Mute a user
- `!unmute <user> [reason]` - Unmute a user
- `!warn <user> <reason>` - Warn a user
- `!clear <amount> [user]` - Clear messages
- `!lockdown [channel] [reason]` - Lock channel
- `!slowmode <seconds> [channel]` - Set slowmode

**Owner Commands:**
- `!maintenance [on|off|status]` - Maintenance mode
- `!eval <code>` - Execute JavaScript code
- `!restart [--force]` - Restart the bot
- `!reload <command>` - Reload commands

### Slash Commands (30+)
**General Commands:**
- `/ping` - Check bot latency
- `/avatar [user]` - Show user avatar
- `/userinfo [user]` - User information
- `/serverinfo` - Server information
- `/help` - Help menu

**Moderation Commands:**
- `/ban <user> [reason]` - Ban with confirmation
- `/kick <user> [reason]` - Kick a user
- `/mute <user> [duration] [reason]` - Timeout user
- `/unmute <user> [reason]` - Remove timeout
- `/warn <user> <reason>` - Issue warning
- `/clear <amount> [user]` - Bulk delete messages
- `/lockdown [channel] [reason]` - Lock channel
- `/slowmode <duration> [channel]` - Set slowmode
- `/case [case_id] [user]` - View moderation cases
- `/softban <user> [reason]` - Softban (ban + unban)
- `/prune <days> [dry_run]` - Remove inactive members
- `/role <add|remove> <user> <role>` - Manage roles
- `/unban <user_id> [reason]` - Unban user
- `/nick <user> [nickname]` - Change nickname
- `/warnings <view|clear> <user>` - Manage warnings
- `/massban <user_ids> [reason]` - Mass ban for raids
- `/automod <setting> <enabled>` - Configure automod
- `/modstats [moderator]` - Moderation statistics
- `/lockserver [reason]` - Emergency server lockdown

## 🎭 Role-Based Permissions

### Permission Levels:
- **Owner (10):** Full access to all commands
- **Sub Owner (9):** Maintenance, eval, restart, reload
- **Admin (8):** All moderation + server management
- **Manager (7):** Most moderation commands
- **Developer (6):** Eval, reload, debug commands
- **Moderator (5):** Basic moderation (kick, mute, warn)
- **Helper (4):** Limited moderation (warn, clear)
- **Tester (3):** Debug and test commands
- **User (0):** General commands only

### Role Configuration:
Edit `src/config/roles.json` to configure role names and permissions for your server.

## 🔧 Special Features

### Maintenance Mode:
- Disables all commands for non-owners
- Shows maintenance message to users
- Configurable reason and duration
- Shard-compatible

### Interactive Elements:
- Button confirmations for destructive actions
- Select menus for help categories
- Modal forms for complex inputs
- Context menus for quick actions

### Anti-Spam System:
- Automatic spam detection
- Message similarity analysis
- Rate limiting protection
- Configurable thresholds

### Case Management:
- UUID-based case tracking
- Automatic expiration
- Evidence attachment support
- Comprehensive logging

## 🎨 Cute/Femboy Theming

All commands feature:
- 💖 Pink and pastel color schemes
- ✨ Adorable emojis and reactions
- 🌸 Cute footer messages
- 💕 Friendly error messages
- 🦄 Kawaii embed designs

## 📊 Usage Examples

```bash
# Prefix Commands
!ping
!help moderation
!ban @user Spamming
!clear 50
!maintenance on Server update

# Slash Commands
/ping
/ban user:@user reason:Spamming
/clear amount:50 user:@user
/lockserver reason:Emergency
```

## 🔄 Command Aliases

Most commands have multiple aliases:
- `ping` → `pong`, `latency`
- `help` → `h`, `commands`, `cmd`
- `avatar` → `av`, `pfp`, `profile`
- `userinfo` → `ui`, `user`, `whois`
- `serverinfo` → `si`, `server`, `guildinfo`

---

Made with 💖 by Astra - Your cute moderation assistant!