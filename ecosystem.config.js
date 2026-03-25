module.exports = {
  apps: [
    {
      name: 'yourfinance-frontend',
      script: './node_modules/serve/build/main.js',
      args: '-s build -l 3000',
      cwd: './frontend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: '../logs/frontend-error.log',
      out_file: '../logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'yourfinance-backend',
      script: 'python',
      args: 'manage.py runserver 0.0.0.0:8000 --noreload',
      cwd: './backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        DEBUG: 'True',
        PYTHONUNBUFFERED: '1',
        DJANGO_SETTINGS_MODULE: 'backend.settings',
      },
      env_production: {
        DEBUG: 'True',
        PYTHONUNBUFFERED: '1',
        DJANGO_SETTINGS_MODULE: 'backend.settings',
      },
      error_file: '../logs/backend-error.log',
      out_file: '../logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    }
  ],
};
