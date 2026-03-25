@echo off
setlocal enabledelayedexpansion

echo Starting YourFinance Windows Deployment...

:: 1. Install Dependencies
echo Installing root dependencies...
call npm install

echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo Installing backend dependencies...
if exist "backend\requirements.txt" (
    pip install -r backend\requirements.txt
) else (
    echo Warning: backend\requirements.txt not found. Skipping backend dependency installation.
)

:: 2. Build Frontend
echo Building frontend...
cd frontend
call npm run build
cd ..

:: 3. PM2 Operations
echo Starting services with PM2...
:: Start/Restart services using ecosystem file
call pm2 start ecosystem.config.js --env production

:: 4. Persistence
echo Saving PM2 process list...
call pm2 save

echo Deployment complete! Use 'pm2 list' to check service status.
echo Check logs in the 'logs/' directory.
pause
