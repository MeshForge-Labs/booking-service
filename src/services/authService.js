const config = require('../config');
const { createClient } = require('../utils/httpClient');
const logger = require('../utils/logger');

const client = createClient(config.services.authServiceUrl);

async function validateToken(authorizationHeader) {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return null;
  }
  try {
    const res = await client.get('/api/auth/validate', {
      headers: { Authorization: authorizationHeader },
    });
    if (res.status !== 200 || !res.data || !res.data.valid) {
      return null;
    }
    return {
      subject: res.data.subject,
      roles: res.data.roles || [],
    };
  } catch (err) {
    logger.warn('Auth service validate failed', { error: err.message });
    return null;
  }
}

module.exports = { validateToken };
