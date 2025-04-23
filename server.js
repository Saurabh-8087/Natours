/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/newline-after-import */
/* eslint-disable import/order */
/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err=>{
  console.log('Uncaught Exexption!💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({path:'./config.env'});
const app = require('./app');
// const Tour = require('./models/tourModel');

// const DB = process.env.DATABASE;
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB,{
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false
}).then(() =>console.log("DB Connection successful!"));

//To Specify a schema for ou data


// console.log(process.env.NODE_ENV);
const port = process.env.PORT  || 3000;
// const server = app.listen(port, ()=>{
//   console.log(`App running on port : ${port}....;`);
// } );
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`App running on port : ${port}....`);
});

process.on('unhandledRejection', err => {
  console.log('unhandled Rejection ! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(()=>{
    process.exit(1);

  });
});



