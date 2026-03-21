const bookingService = require('../services/bookingService');
const logger = require('../utils/logger');

async function createBooking(req, res, next) {
  try {
    const { eventId, seats } = req.body;
    const authHeader = req.headers.authorization;
    const booking = await bookingService.createBooking(eventId, seats, authHeader);
    res.status(201).json(booking);
  } catch (err) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}

async function getBookingById(req, res, next) {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const booking = await bookingService.getBookingById(id, authHeader);
    res.status(200).json(booking);
  } catch (err) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}

async function listMyBookings(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const bookings = await bookingService.listMyBookings(authHeader);
    res.status(200).json(bookings);
  } catch (err) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const booking = await bookingService.cancelBooking(id, authHeader);
    res.status(200).json(booking);
  } catch (err) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}

module.exports = { createBooking, getBookingById, listMyBookings, cancelBooking };
