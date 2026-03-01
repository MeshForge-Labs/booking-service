const express = require('express');
const { body, param } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const { validate } = require('../middleware/validate');

const router = express.Router();

const createBookingValidation = [
  body('eventId').notEmpty().withMessage('eventId is required').isInt({ min: 1 }).withMessage('eventId must be a positive integer').toInt(),
  body('seats').notEmpty().withMessage('seats is required').isInt({ min: 1 }).withMessage('seats must be at least 1').toInt(),
];

const getBookingValidation = [
  param('id').isUUID().withMessage('Invalid booking id'),
];

router.post('/', createBookingValidation, validate, bookingController.createBooking);
router.get('/:id', getBookingValidation, validate, bookingController.getBookingById);

module.exports = router;
