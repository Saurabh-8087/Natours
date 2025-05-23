/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
// const fs = require('fs');
//all imports
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRoute');
const bookingRoute = require('./routes/bookingRoute');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname,'views'));

//1) GLOBAL MIDDLEWARES
//set securite HTTP header
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet())

//Development login
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit requesest from same api
const limiter = rateLimit({
    max:100,
    windowMs:60*60*1000,
    message: 'To many request from this IP, Please try in an hour!'
});

app.use('/api',limiter);

//Body parser, reading data from body into req.body
app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({
  extended:true,
  limit:'10kb'
}))
app.use(cookieParser());

//data sanitization against NoSql quesry injection
  app.use(mongoSanitize());

//data sanitization against  xss
app.use(xss());

//prevent parameter pollution
app.use(hpp({
  whitelist:[
    'duration','ratingsQuantity','ratingsAverage','maxGroupSize','difficulty','price'
  ]
}));

// servig static files
// app.use(express.static(`${__dirname}/public`));


// app.use((req, res, next) => {
//   console.log('Hello from the middeware');
//   next();
// });

//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);

  next();
});

// routes

app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRoute);


app.all('*', (req, res, next)=>{
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

//start the server
module.exports = app;
