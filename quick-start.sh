#!/bin/bash

echo "🌸 Quick Starting Astra Bot..."

# Check .env
if [ ! -f .env ]; then
    echo "❌ .env not found!"
    exit 1
fi

# Deploy commands silently
node src/handlers/deploy.js global > /dev/null 2>&1

# Start bot
exec node bot.js