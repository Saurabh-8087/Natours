/* eslint-disable no-lonely-if */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
/* eslint-disable prettier/prettier */
/* eslint-disable import/newline-after-import */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable prettier/prettier */

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};



const handleDuplicateFieldsDB = err=>{
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value : ${value} please use another value!`

  return new AppError(message, 400);
};

const handleValidationErrorDB = err=>{
  const errors = Object.values(err.errors).map(el =>el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. please log in again', 401);

const handleJWTExiredError = () => new AppError('Your tokn has expired! please login again.', 401);


const sendErrorDev = (err,req, res) =>{
  //API
  if (req.originalUrl.startsWith('/api')){
    return res.status(err.statusCode).json({
      status: err.status,
      error:err,
      message: err.message,
      stack: err.stack,
    });
  }
    //RENDERD WEBSITE
    return res.status(err.statusCode).render('error', {
      title:'Something went wrong!',
      msg: err.message
    });
  
};

const sendErrorProd =(err,req, res)=>{
//operational, trusted error: send message to client
if (req.originalUrl.startsWith('/api')){
  if(err.isOperational){
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      
    });
  }
  //Programming or other unkown error: don't leak error details
  console.error('ERROR 💥', err);

   return res.status(500).json({
      status:'error',
      message:'Something went very wrong!'
    });
  
}

  if(err.isOperational){
     return res.status(err.statusCode).render('error', {
      title:'Something went wrong!',
      msg: err.message
    });
  }
  //Programming or other unkown error: don't leak error details
  console.error('ERROR 💥', err);

    return res.status(err.statusCode).render('error', {
      title:'Something went wrong!',
      msg: 'Please try again later'
    });
  

};


const AppError = require('./../utils/appError');


module.exports = (err, req, res, next) => {
  console.error('ERROR 💥', err);

  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err, message: err.message }; // make a shallow copy

  // Handle CastError (invalid MongoDB ObjectId)
  // if (err.name === 'CastError') error = handleCastErrorDB(err);

  if(process.env.NODE_ENV === 'development'){
      sendErrorDev(error,req, res);
  }else if(process.env.NODE_ENV === 'production'){
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if(err.code === 11000) error= handleDuplicateFieldsDB(err);
    if(err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if(err.name === 'JsonWebTokenError') error= handleJWTError();
    if(err.name === 'TokenExpiredError') error = handleJWTExiredError();


    
  sendErrorProd(error,req, res);
  }

 
};


