/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('./../controllers/authController');
const { route } = require('./tourRouter');

const router = express.Router({mergeParams:true});

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
     authController.restrictTo('user'),
     reviewController.createReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authController.restrictTo('user', 'admin'),reviewController.updateReview)
  .delete(authController.restrictTo('user','admin'),reviewController.deleteReview);


  module.exports = router;  