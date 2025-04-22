/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const  bcrypt = require('bcryptjs');



const { isLowercase } = require('validator');
const { validate } = require('./tourModel');

const userSchema = new mongoose.Schema({
  name:{
    type:String,
    required: [true, 'Enter you name']
    // ,unique: true,
    // trim:true
  },
  email:{
    type:String,
    required: [true, 'Please provied your email'],
    unique: true,
    lowercase:true,
    validate:[validator.isEmail, 'Please provide a vaild email']
    
  },
  photo :{
    type:String,
    default:'default.jpg'
  },
  role :{
    type:String,
    enum:['user', 'guide', 'lead-guide', 'admin'],
    default:'user'
  },

  password:{
    type:String,
    required: [true, 'Please provied your password'],
    minlength:8,
    select:false
  },

  passwordConfirm:{
    type:String ,
    required: [true, 'Please confirm your password'],
    validate:{
      //this only work on create and save!!!
      validator: function(el){
        return el === this.password;
      },
      message:'password are not same'
    }
  },
 passwordChangedAt: Date,

 passwordResetToken: String,
 passwordResetExpires:Date,

 active:{
  type:Boolean,
  default:true,
  select:false
 }
});
//for password encryption or hashing we user hashing algorithm called bcrypt.
userSchema.pre('save', async function(next){
  //only run this function if password was actually modified
    if(!this.isModified('password')) return next();

    //hash the password with cost of 12.
    this.password =await bcrypt.hash(this.password, 12);

    //delete the passwordConfirm field.
    this.passwordConfirm = undefined;
    next();

});

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();
    
    this.passwordChangedAt = Date.now()-1000;
    next();
});

userSchema.pre(/^find/, function(next){
      //this points to the current query
      this.find({active:{$ne: false}});
      next();
});

userSchema.methods.correctPassword = async function(candidatepasswrd, userPassword){
  return  await bcrypt.compare(candidatepasswrd, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
  if(this.passwordChangedAt){
    const changedTimestams = parseInt(this.passwordChangedAt.getTime() / 1000,10);

    return JWTTimestamp < changedTimestams;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;