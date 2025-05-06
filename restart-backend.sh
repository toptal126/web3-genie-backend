#!/bin/bash

# Pull latest changes
echo "Pulling latest changes from git..."
git pull

# Install dependencies if needed
echo "Installing dependencies..."
pnpm install

# Build the application
echo "Building the application..."
pnpm build

# Restart the PM2 process
echo "Restarting the application..."
pm2 restart forgeonchain-api

echo "Restart completed successfully!" 