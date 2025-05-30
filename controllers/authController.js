/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable arrow-body-style */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');


const signToken = id =>{
  return jwt.sign({ id}, process.env.JWT_SECRET,{
    expiresIn:process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res)=>{
  const token = signToken(user._id);

  //creatring the cookie variable
  const cookieOption = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 *60 * 60 * 1000),
    httpOnly: true
  };


  if(process.env.NODE_ENV === 'production') cookieOption.secure=true;


//Sending the cookie with the jwt token
  res.cookie('jwt',  token, cookieOption);

  //Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status:'success',
    token,
    data:{
      user
    }
  });
}

exports.signup = catchAsync(async (req, res, next) =>{
    const newUser =await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt:req.body.passwordChangedAt,
      role:req.body.role
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, res);
});


exports.login =catchAsync (async (req, res, next) =>{
  const {email, password} = req.body;

  // 1) check if emailand password exits

  if(!email || !password){
     return next(new AppError('Please Provide email and password', 400));
  }

  // 2)check if user exists && password is correct

  const user = await User.findOne({ email }).select('+password');

 if(!user || ! (await user.correctPassword(password, user.password))){
  return next(new AppError('Incorrect email or password', 401));
 }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
  

});

exports.logout=(req, res)=>{
  res.cookie('jwt', 'loggedout',{
    expires: new Date(Date.now() + 10*1000),
    httpOnly: true
  });
  res.status(200).json({status:'success'});
}

//proctect midderware to check user login or not
exports.protect = catchAsync(async(req,res,next) =>{
  let token;
  // 1)getting token and check of it's there
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
     token = req.headers.authorization.split(' ')[1];
  }
  else if(req.cookies.jwt){
    token = req.cookies.jwt;
  }

  if(!token){
    return next(new AppError('Your are not logged in! Please log in to get access.', 401));
  }

   //2)validate/verification token

   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3)check if user still exists

   const currentUser = await User.findById(decoded.id);
   if(!currentUser){
    return next(new AppError('The user belonging to this token does no longer exit.', 401));
   }


  //4)check if user change password after the token was issued
  if(currentUser.changedPasswordAfter(decoded.iat)){
  return next(new AppError('User recently changed password! Please log in again.',401));
 }
  //grant access to protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});


exports.isLoggedIn = async(req,res,next) =>{
  if(req.cookies.jwt){

   //2)validate/verification token
   try {
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

  //3)check if user still exists

   const currentUser = await User.findById(decoded.id);
   if(!currentUser){
    return next();
   }


  //4)check if user change password after the token was issued
  if(currentUser.changedPasswordAfter(decoded.iat)){
  return next();
 }

  res.locals.user = currentUser;
  return next();
   } catch (err) {
    return next()
   }  
}
next();
};

exports.restrictTo = (...roles)=>{
  return (req,res,next)=>{
    //roles['admin', 'lead-guide']. role ='user'
    if(!roles.includes(req.user.role)){
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async(req,res,next)=>
{
  //1)get user based  on post email

  const user = await User.findOne({email:req.body.email});

  if(!user){
    return next(new AppError('There is no user with this email address.', 404));
  }

  //2)Generate the random reset token

  const resetToken = user.createPasswordResetToken();

  await user.save({validateBeforeSave: false});





  //3)Send it to user's email

  
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/forgotPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();
  
    res.status(200).json({
      status:'success',
      message:'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetExpires = undefined;
    await user.save({validateBeforeSave: false});

    // return next(new AppError('There was an error sending the email.Try again later!', 500) );
    return next(new AppError('There was an error sending the email. Try again later!', 500));

   
  }

});

exports.resetPassword =catchAsync(async (req,res,next)=>{
  //1) get user based on token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {
    $gt:Date.now()
  }});

  //2) If token has not expired , and ther is user, set the new password

  if(!user){
    return next(new AppError('Token is invalied or has expired', 400));
  }

  user.password = req.body.password;;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken=undefined;
  user.passwordResetExpires=undefined;

  await user.save();

  //3)Update changedPasswordAt property for user 


  //4) log the user in, send jwt
  createSendToken(user, 200, res);
  
});

exports.updatePassword = catchAsync(async(req,res,next)=>{
  //1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  //2) Check if POSTED current password is correct
  if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
    return next(new AppError('Current password is wrong', 401));
  }
  //3) if so, update password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  //4) Log user in, Send JWT
  createSendToken(user, 200, res);

});
