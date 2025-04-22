/*eslint-disable*/
// import axios from "axios";
// const stripe = stripe('pk_test_51RGXeTF7KrEEcqtilcgbvtKngfqkMOqat3iw4I9YTWLwtlgEKaCgdP2vmr74Kl3TwMZ0TX2ZJRGgBM2bHIZoyaeX00qH6DT4bV');

// export const bookTour = async tourId=>{
//     //get checkout session from server/api

//     const session = await axios(`http://127.0.0.1:3000/api/v1/booking/checkout-session/${tourId}`) ;

//     console.log(session);
//     // create checkout from+chard credit card
// }

import axios from "axios";
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51RGXeTF7KrEEcqtilcgbvtKngfqkMOqat3iw4I9YTWLwtlgEKaCgdP2vmr74Kl3TwMZ0TX2ZJRGgBM2bHIZoyaeX00qH6DT4bV');

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/booking/checkout-session/${tourId}`);

    // 2) Load Stripe object
    const stripe = await stripePromise;

    // 3) Redirect to Stripe checkout
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.error('Booking error:', err);
    alert('Something went wrong while booking the tour!');
  }
};
