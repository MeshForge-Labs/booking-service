const config = require('../config');
const { createClient } = require('../utils/httpClient');
const logger = require('../utils/logger');

const client = createClient(config.services.eventServiceUrl);

async function getEvent(eventId, authorizationHeader) {
  try {
    const res = await client.get(`/api/events/${eventId}`, {
      headers: { Authorization: authorizationHeader },
    });
    if (res.status !== 200) {
      return { found: false, data: null };
    }
    return { found: true, data: res.data };
  } catch (err) {
    logger.warn('Event service get failed', { eventId, error: err.message });
    return { found: false, data: null };
  }
}

async function reserveSeats(eventId, quantity, authorizationHeader) {
  try {
    const res = await client.put(`/api/events/${eventId}/reserve`, { quantity }, {
      headers: { Authorization: authorizationHeader },
    });
    if (res.status === 200) {
      return { success: true, data: res.data };
    }
    if (res.status === 409) {
      return { success: false, conflict: true, message: res.data?.message || 'Not enough seats' };
    }
    if (res.status === 404) {
      return { success: false, notFound: true };
    }
    return { success: false, message: res.data?.message || 'Reserve failed' };
  } catch (err) {
    logger.warn('Event service reserve failed', { eventId, quantity, error: err.message });
    return { success: false, message: err.message };
  }
}

module.exports = { getEvent, reserveSeats };
