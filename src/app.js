const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const swaggerSpec = require('./config/swagger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/health', healthHandler);
app.get('/health/ready', readinessHandler);
app.use('/api', routes);
app.use(errorHandler);

function healthHandler(req, res) {
  res.status(200).json({ status: 'UP', service: 'booking-service', timestamp: new Date().toISOString() });
}

async function readinessHandler(req, res) {
  const { pool } = require('./models/db');
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    res.status(200).json({ status: 'UP', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'DOWN', database: 'disconnected', error: err.message });
  }
}

app.listen(config.port, () => {
  logger.info('Server listening', { port: config.port, nodeEnv: config.nodeEnv });
});

module.exports = app;
