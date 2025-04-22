/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
const express = require('express');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apifeatures');
const AppError = require('./../utils/appError');
const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

exports.getAllReviews = factory.getAll(Review);



exports.getReview = factory.getOne(Review);



exports.createReview = catchAsync(async(req, res, next) => {
  //allow nested routes
  if(!req.body.tour) req.body.tour = req.params.tourId;
  if(!req.body.user) req.body.user = req.user.id; 
  const newReview =   await Review.create(req.body);

res.status(201).json({
  status:'success',
  data:{
    review: newReview
  }
});
});

// exports.updateReview = catchAsync(async(req, res, next) => {
//   const review =await Review.findByIdAndUpdate(req.params.id, req.body,{
//     new: true,
//     runValidators:true
//   });
//   if(!review){
//     return next(new AppError('No review find that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//      review
//   });
// });

exports.updateReview=factory.updateOne(Review);
exports.deleteReview = 
factory.deleteOne(Review);