const axios = require('axios');
const config = require('../config');
const logger = require('./logger');

const timeout = config.http.timeoutMs;

function createClient(baseURL) {
  const client = axios.create({
    baseURL,
    timeout,
    headers: { 'Content-Type': 'application/json' },
    validateStatus: () => true,
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.code === 'ECONNABORTED') {
        logger.warn('HTTP timeout', { url: error.config?.url, baseURL });
      } else {
        logger.warn('HTTP error', { message: error.message, url: error.config?.url });
      }
      return Promise.reject(error);
    }
  );

  return client;
}

module.exports = {
  createClient,
  timeout,
};
