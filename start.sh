#!/bin/bash

echo "🌸 Starting Astra Bot..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Start the bot
exec node bot.js