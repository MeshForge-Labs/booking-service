const { randomUUID } = require('crypto');
const authService = require('./authService');
const eventService = require('./eventService');
const notificationService = require('./notificationService');
const Booking = require('../models/Booking');
const logger = require('../utils/logger');

async function createBooking(eventId, quantity, authorizationHeader) {
  const auth = await authService.validateToken(authorizationHeader);
  if (!auth) {
    const err = new Error('Invalid or missing token');
    err.statusCode = 401;
    throw err;
  }
  const userId = auth.subject;

  const eventResult = await eventService.getEvent(eventId, authorizationHeader);
  if (!eventResult.found) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }

  const reserveResult = await eventService.reserveSeats(eventId, quantity, authorizationHeader);
  if (!reserveResult.success) {
    if (reserveResult.conflict) {
      const err = new Error(reserveResult.message || 'Not enough seats');
      err.statusCode = 409;
      throw err;
    }
    if (reserveResult.notFound) {
      const err = new Error('Event not found');
      err.statusCode = 404;
      throw err;
    }
    const err = new Error(reserveResult.message || 'Reserve failed');
    err.statusCode = 502;
    throw err;
  }

  const pool = Booking.getPool();
  const client = await pool.connect();
  try {
    const id = randomUUID();
    const booking = await Booking.create(client, {
      id,
      userId,
      eventId: String(eventId),
      quantity,
      status: 'CONFIRMED',
    });
    logger.info('Booking created', { bookingId: id, userId, eventId, quantity });

    setImmediate(() => {
      notificationService.notifyBooking(booking, authorizationHeader).catch(() => {});
    });

    return booking;
  } finally {
    client.release();
  }
}

async function getBookingById(id, authorizationHeader) {
  const auth = await authService.validateToken(authorizationHeader);
  if (!auth) {
    const err = new Error('Invalid or missing token');
    err.statusCode = 401;
    throw err;
  }

  const pool = Booking.getPool();
  const client = await pool.connect();
  try {
    const booking = await Booking.findById(client, id);
    if (!booking) {
      const err = new Error('Booking not found');
      err.statusCode = 404;
      throw err;
    }
    if (booking.userId !== auth.subject && !auth.roles.includes('ROLE_ADMIN')) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }
    return booking;
  } finally {
    client.release();
  }
}

module.exports = { createBooking, getBookingById };
