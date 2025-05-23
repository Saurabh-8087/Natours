/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prettier/prettier */
const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');


const router = express.Router();

// router.use(authController.isLoggedIn);

router.get('/',bookingController.createBookingCheckout,authController.isLoggedIn, viewController.getOverview);

router.get('/tour/:slug',authController.isLoggedIn, viewController.getTour);
router.get('/login',authController.isLoggedIn, viewController.getLoginForm);
router.get('/singup', viewController.getSingupForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);

router.post('/submit-user-data', authController.protect, viewController.updateUserData);


module.exports= router;
