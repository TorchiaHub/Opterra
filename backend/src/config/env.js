const env = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    name: process.env.DB_NAME || 'tenderflow',
    user: process.env.DB_USER || 'tenderflow_user',
    password: process.env.DB_PASSWORD || 'tenderflow_pass',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  },

  storage: {
    path: process.env.STORAGE_PATH || '/storage',
  },

  ai: {
    openaiKey: process.env.OPENAI_API_KEY || '',
  },

  scraping: {
    cron: process.env.SCRAPING_CRON || '0 6 * * *',
  },
}

export default env
