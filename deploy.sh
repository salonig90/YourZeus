#!/bin/bash

# YourFinance Deployment Script for Linux

echo "Starting deployment process..."

# 1. Install Dependencies
echo "Installing root dependencies..."
npm install

echo "Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "Installing backend dependencies..."
# Assuming a virtual environment is used or global python/pip
if [ -f "backend/requirements.txt" ]; then
    pip install -r backend/requirements.txt
else
    echo "Warning: backend/requirements.txt not found. Skipping backend dependency installation."
fi

# 2. Build Frontend
echo "Building frontend..."
cd frontend && npm run build && cd ..

# 3. PM2 Operations
echo "Starting services with PM2..."
# Install PM2 globally if not present
if ! command -v pm2 &> /dev/null
then
    echo "PM2 not found, installing globally..."
    npm install -g pm2
fi

# Start/Restart services using ecosystem file
pm2 start ecosystem.config.js --env production

# 4. Persistence
echo "Saving PM2 process list..."
pm2 save

# 5. Startup on Reboot
echo "Enabling PM2 startup on reboot..."
pm2 startup

echo "Deployment complete! Use 'pm2 list' to check service status."
echo "Check logs in the 'logs/' directory."
