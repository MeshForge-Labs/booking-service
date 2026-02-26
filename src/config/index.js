require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT || '8082', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/booking_db',
    max: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },

  services: {
    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:8080',
    eventServiceUrl: process.env.EVENT_SERVICE_URL || 'http://localhost:8081',
    notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8083',
  },

  http: {
    timeoutMs: parseInt(process.env.HTTP_TIMEOUT_MS || '10000', 10),
  },
};
