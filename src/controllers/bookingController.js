const bookingService = require('../services/bookingService');
const logger = require('../utils/logger');

async function createBooking(req, res, next) {
  try {
    const { eventId, quantity } = req.body;
    const authHeader = req.headers.authorization;
    const booking = await bookingService.createBooking(eventId, quantity, authHeader);
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

module.exports = { createBooking, getBookingById };
