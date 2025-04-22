/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable import/newline-after-import */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
const  fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');



const DB = process.env.DATABASE;
mongoose
.connect(DB,{
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false
})
.then(() =>console.log("DB Connection successful for file save!"));


//Read JSON File

const tours =JSON.parse( fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users =JSON.parse( fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews =JSON.parse( fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//Import the data into db

const importData = async() =>{
  try {
    await Tour.create(tours);
    await User.create(users, {validateBeforeSave: false});
    await Review.create(reviews);
    console.log('Data Successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};


//delete all data from the collection

const deleteDate =async () =>{
  try {
    await Tour.deleteMany();
    await User.deleteMany({ email: null });
    await Review.deleteMany();
    console.log('Data Successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if(process.argv[2] === '--import'){
  importData();
}
else if(process.argv[2] === '--delete'){
  deleteDate();
}
