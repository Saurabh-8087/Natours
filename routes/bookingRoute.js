/* eslint-disable */
const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('./../controllers/authController');
const { route } = require('./tourRouter');

const router = express.Router();

router.use(authController.protect);
router.get('/checkout-session/:tourId', bookingController.getCheckOutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router.route('/').get(bookingController.getAllBooking).post(bookingController.CreateBooking);

router.route('/:id').get(bookingController.getBooking).patch(bookingController.updateBooking).delete(bookingController.deleteBooking);


  module.exports = router;  