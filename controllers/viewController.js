/* eslint-disable prettier/prettier */
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');


exports.getOverview = catchAsync(async(req,res, next)=>{
  //1)get all tour data from collection
  const tours = await Tour.find();

  //2) bulid templet
  //3)render that templete using tour data from 1
  res.status(200).render('overview',{
    title: 'All Tours',
    tours
  });
});

exports.getTour =catchAsync(async(req,res, next)=>{
  const tour = await Tour.findOne({slug: req.params.slug}).populate({path: 'reviews', fields: 'review rating user'})
  // res.status(200).render('tour',{
  //   title: 'The Forest Hiker Tour'
  // });

  if(!tour){
    return next(new AppError('There is no tour with that name', 404));
  }

  res.status(200).render('tour',{
    title:`${tour.name} Tour`,
    tour

  });
});

exports.getLoginForm = (req, res) =>{
    res.status(200).render('login',{
      title:'Log Into your Account'
    });
};

exports.getSingupForm = (req, res) =>{
  res.status(200).render('singup',{
    title:'Singup Into your Account'
  });
};

exports.getAccount= (req, res) =>{
  res.status(200).render('account',{
    title:'your Account'
  });
};

exports.getMyTours=catchAsync(async (req,res,next)=>{
      //find all booking 
      const booking =await Booking.find({user:req.user.id});
      //find tours with the returned IDs
      const tourIDs = booking.map(el=>el.tour);
      const tours = await Tour.find({_id:{$in:tourIDs}});

      res.status(200).render('overview',{
        title:'My Tours',
        tours
      });

      next();
});

exports.updateUserData =catchAsync(async (req, res) =>{
  const updatedUser = await User.findByIdAndUpdate(req.user.id, {
    name:req.body.name,
    email:req.body.email
  },{
      new:true,
      runValidators:true
  });
  res.status(200).render('account',{
    title:'your Account',
    user: updatedUser
  });

});