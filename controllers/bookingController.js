/*eslint-disable */
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const Booking = require('./../models/bookingModel');


exports.getCheckOutSession =catchAsync(async (req, res, next)=>{
  //grt currently bookrd tour
  const tour =await Tour.findById(req.params.tourId);

  //create checkout session

//  const session = await stripe.checkout.sessions.create({
//     payment_method_types:['card'],
//     mode: 'payment',
//     success_url:`${req.protocol}://${req.get('host')}/`,
//     cancel_url:`${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
//     customer_email:req.user.email,
//     client_reference_id:req.params.tourId,
//     line_items: [
//       {
//         price_data: {
//           currency: 'usd',
//           unit_amount: tour.price * 100,
//           product_data: {
//             name: `${tour.name} Tour`,
//             description: tour.summary,
//             images: ['https://natours.dev/img/tours/' + tour.imageCover]
//           }
//         },
//         quantity: 1
//       }
//     ]

//   });
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  mode: 'payment', // Required when using price_data
  success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
  cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
  customer_email: req.user.email,
  client_reference_id: req.params.tourId,
  line_items: [
    {
      price_data: {
        currency: 'usd',
        unit_amount: tour.price * 100, // e.g. 497 * 100 = 49700
        product_data: {
          name: `${tour.name} Tour`, // ✅ This will show up in the Stripe checkout
          description: tour.summary, // ✅ Optional
          images: [`https://natours.dev/img/tours/${tour.imageCover}`] // ✅ Optional (must be HTTPS)
        }
      },
      quantity: 1
    }
  ]
});


  //create session as response
  res.status(200).json({
      status:'success',
      session
  });
});

exports.createBookingCheckout = catchAsync(async(req,res,next)=>{
  const {tour, user, price} = req.query;

  if(!tour && !user && !price) return next();
  await Booking.create({tour, user, price});

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllBooking = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.CreateBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
