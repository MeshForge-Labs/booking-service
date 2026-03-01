const config = require('../config');
const { createClient } = require('../utils/httpClient');
const logger = require('../utils/logger');

const client = createClient(config.services.notificationServiceUrl);

async function notifyBooking(booking, authorizationHeader) {
  try {
    const res = await client.post(
      '/api/notifications',
      {
        bookingId: booking.id,
        email: booking.userId,
        eventId: booking.eventId,
        quantity: booking.quantity,
      },
      { headers: { Authorization: authorizationHeader } }
    );
    if (res.status >= 200 && res.status < 300) {
      logger.info('Notification sent', { bookingId: booking.id });
      return true;
    }
    logger.warn('Notification service returned non-success', { status: res.status, bookingId: booking.id });
    return false;
  } catch (err) {
    logger.warn('Notification service call failed', { bookingId: booking.id, error: err.message });
    return false;
  }
}

module.exports = { notifyBooking };
