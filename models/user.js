const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   phoneNumber: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 10,
      unique: true
   },
   isMale: Boolean,
   birthYear: {
      type: Number,
      min: 1300,
      max: 1400
   },
   createdTime: {
      type: Date,
      default: Date.now,
      required: true
   },
   isActive: {
      type: Boolean,
      default: true,
      required: true
   },
   lastLoginIp: String,
   lastLoginTime: Date,
   smsVerificationCode: String,
   smsVerificationCodeCreationTime: Date,
   refreshToken: String,
   roles: [
      {
         type: String
      }
   ]
});

userSchema.methods.generateAuthAccessToken = function() {
   return jwt.sign(
      { roles: this.roles, phoneNumber: this.phoneNumber },
      config.get('jwtAccessTokenPrivateKey'),
      {
         expiresIn: '24h'
      }
   );
};

userSchema.methods.generateAuthRefreshToken = function() {
   return jwt.sign(
      { phoneNumber: this.phoneNumber },
      config.get('jwtRefreshTokenPrivateKey'),
      {
         expiresIn: '90d'
      }
   );
};

userSchema.methods.generateVerifyPhoneNumberToken = function() {
   return jwt.sign(
      { phoneNumber: this.phoneNumber },
      config.get('jwtVeriyPhoneNumberPrivateKey'),
      {
         expiresIn: 600
      }
   );
};

userSchema.methods.generateSmsVerificationCode = function() {
   const randNumb = () => String(Math.floor(Math.random() * 10));

   return (
      randNumb() +
      randNumb() +
      randNumb() +
      randNumb() +
      randNumb() +
      randNumb()
   );
};

const User = mongoose.model('User', userSchema);

const validateUserPhoneNumber = userPhoneNumber => {
   const schema = {
      phoneNumber: Joi.string()
         .min(10)
         .max(10)
         .regex(/^9[0-9]{9}$/)
         .required()
   };

   return Joi.validate(userPhoneNumber, schema);
};

const validateUserLogin = userLoginObject => {
   const schema = {
      token: Joi.string().required(),
      smsVerificationCode: Joi.string()
         .required()
         .min(6)
         .max(6)
   };

   return Joi.validate(userLoginObject, schema);
};

const validateGetAccessToken = getAccessTokenObject => {
   const schema = {
      accesstoken: Joi.string().required(),
      refreshtoken: Joi.string().required()
   };

   return Joi.validate(getAccessTokenObject, schema);
};

module.exports = {
   User,
   validateUserPhoneNumber,
   validateUserLogin,
   validateGetAccessToken
};
