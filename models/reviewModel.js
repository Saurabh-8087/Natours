/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema =  new mongoose.Schema({
    review:{
      type:String,
      reduried:[true, 'Review can not be empty!']
    },
    rating:{
      type:Number,
      min:1,
      max:5
    },
    createdAt:{
      type:Date,
      default:Date.now
    },
    tour:{
      type:mongoose.Schema.ObjectId,
      ref:'Tour',
      requried:[true, 'Review must belong to a tour.']
    },
    user:{
      type:mongoose.Schema.ObjectId,
      ref:'User',
      requried:[true, 'Review must belong to a user.']
    }
},
{
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
}
);

reviewSchema.index({tour:1, user:1},{unique:true});

//populate the user and tour on review
reviewSchema.pre(/^find/, function(next){
    // this.populate({
    //   path:'tour',
    //   select:'name'
    // }).populate({
    //   path:'user',
    //   select:'name photo'
    // });

    this.populate({
      path:'user',
      select:'name photo'
    });
  next();
});
//calculate the average rating.
reviewSchema.statics.calcAverageRatings = async function(tourId){
  // console.log(tourId);
  const stats = await this.aggregate([
    {
      $match:{tour:tourId}
    }
    ,{
      $group:{
        _id:'$tour',
        nRating:{$sum: 1},
        // avgRating:{: "$rating"}
        avgRating:{ $avg:'$rating'}
        // ,min:{$min:'$rating'}
      }
    }
  ]);
  // console.log(stats);


if(stats.length > 0){
  await Tour.findByIdAndUpdate(tourId,{
    ratingsQuantity:stats[0].nRating,
    ratingsAverage:stats[0].avgRating
  });
}else{
  await Tour.findByIdAndUpdate(tourId,{
    ratingsQuantity:0,
    ratingsAverage:4.5
  });
}
  

};


reviewSchema.post('save', function(){
  //this call to current review
  this.constructor.calcAverageRatings(this.tour);
  
});

reviewSchema.pre(/^findOneAnd/,async function(next){
     this.r = await this.findOne();
    console.log(this.r);
    next();
});
reviewSchema.post(/^findOneAnd/,async function(){
   await this.r.constructor.calcAverageRatings(this.r.tour);
});


const Review = mongoose.model('Review', reviewSchema);



module.exports = Review;