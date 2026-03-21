const { Pool } = require('pg');
const config = require('../config');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: config.database.connectionString,
  max: config.database.max,
  idleTimeoutMillis: config.database.idleTimeoutMillis,
  connectionTimeoutMillis: config.database.connectionTimeoutMillis,
  ssl: config.database.ssl
    ? { rejectUnauthorized: config.database.sslRejectUnauthorized }
    : false,
});

pool.on('error', (err) => logger.error('Pool error', { error: err.message }));

module.exports = { pool };