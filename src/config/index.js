require('dotenv').config();

const apiGatewayUrl = process.env.API_GATEWAY_URL;
const defaultDbUrl = 'postgresql://postgres:postgres@localhost:5432/booking_db';

function normalizeDatabaseUrl(rawValue) {
  if (!rawValue) return defaultDbUrl;

  let value = String(rawValue).trim();

  // Some secret providers/template pipelines can inject wrapping quotes.
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  // Accept JDBC-style Postgres URLs used by Java services.
  if (value.startsWith('jdbc:postgresql://')) {
    value = value.replace(/^jdbc:/, '');
  }

  // Accept host:port/db and localhost:5432/db shapes by adding protocol.
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value) && /^[^/\s]+(:\d+)?\/[^\s]+$/.test(value)) {
    value = `postgresql://${value}`;
  }

  // Template placeholders should never reach runtime connection parsing.
  if (/\$\{[^}]+\}|<[^>]+>/.test(value)) {
    return defaultDbUrl;
  }

  try {
    const parsed = new URL(value);
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
      return defaultDbUrl;
    }
  } catch {
    return defaultDbUrl;
  }

  return value || defaultDbUrl;
}

module.exports = {
  port: parseInt(process.env.PORT || '8082', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),
    max: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },

  services: {
    authServiceUrl: process.env.AUTH_SERVICE_URL || apiGatewayUrl || 'http://localhost:8080',
    eventServiceUrl: process.env.EVENT_SERVICE_URL || apiGatewayUrl || 'http://localhost:8081',
    notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || apiGatewayUrl || 'http://localhost:8083',
  },

  http: {
    timeoutMs: parseInt(process.env.HTTP_TIMEOUT_MS || '10000', 10),
  },
};