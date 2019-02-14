const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const axios = require('axios');
const express = require('express');
const router = express.Router();
const {
   User,
   validateUserPhoneNumber,
   validateUserLogin,
   validateGetAccessToken
} = require('../models/user');
const auth = require('../middleware/auth');
const checkRoles = require('../middleware/checkRoles');

router.get('/', [auth, checkRoles(['admin'])], async (req, res) => {
   const users = await User.find().select();

   res.send(users);
});

router.get('/me', auth, async (req, res) => {
   const user = await User.findById(req.user._id).select('phoneNumber');

   res.send(user);
});

router.post('/verifyPhoneNumber', async (req, res) => {
   const { error } = validateUserPhoneNumber(req.body);
   if (error) return res.status(400).send(error.details[0].message);

   let user = await User.findOne({ phoneNumber: req.body.phoneNumber });

   if (!user) {
      user = new User(_.pick(req.body, ['phoneNumber']));
   } else {
      if (user.isActive === false) {
         return res.status(400).send('user is not active.');
      }
   }

   const smsVerificationCode = user.generateSmsVerificationCode();
   const salt = await bcrypt.genSalt(10);

   user.smsVerificationCode = await bcrypt.hash(smsVerificationCode, salt);
   user.smsVerificationCodeCreationTime = Date.now();

   await user.save();

   const response = await axios.get(
      `http://37.130.202.188/class/sms/webservice/send_url.php?from=+9850001040500659&to=+98${
         user.phoneNumber
      }&uname=09124376448&pass=0014098989&msg=${smsVerificationCode}`
   );

   res.send(user.generateVerifyPhoneNumberToken());
});

router.post('/login', async (req, res) => {
   const { error } = validateUserLogin(req.body);
   if (error) return res.status(400).send(error.details[0].message);

   const decodedToken = jwt.verify(
      req.body.token,
      config.get('jwtVeriyPhoneNumberPrivateKey')
   );

   const user = await User.findOne({ phoneNumber: decodedToken.phoneNumber });

   const validSmsVerificationCode = await bcrypt.compare(
      req.body.smsVerificationCode,
      user.smsVerificationCode
   );

   if (!validSmsVerificationCode)
      return res.status(400).send('Invalid Sms Verification Code');

   if (Date.now() - user.smsVerificationCodeCreationTime > 600000)
      return res.status(400).send('Sms Verification Code has expired');

   const accesstoken = user.generateAuthAccessToken();
   user.refreshToken = user.generateAuthRefreshToken();
   user.smsVerificationCodeCreationTime = null;
   user.smsVerificationCode = null;
   user.lastLoginTime = Date.now();
   user.lastLoginIp = req.ip;

   await user.save();

   res.header('x-auth-accesstoken', accesstoken)
      .header('x-auth-refreshtoken', user.refreshToken)
      .send(_.pick(user, ['_id', 'phoneNumber']));
});

router.post('/getAccessToken', async (req, res) => {
   const { error } = validateGetAccessToken(req.body);
   if (error) return res.status(400).send(error.details[0].message);

   let decodedRefreshToken = jwt.verify(
      req.body.refreshtoken,
      config.get('jwtRefreshTokenPrivateKey')
   );

   const user = await User.findOne({
      phoneNumber: decodedRefreshToken.phoneNumber
   });

   if (user.refreshToken !== req.body.refreshtoken)
      return res.status(400).send('Invalid tokens');

   const decodedAccesstoken = jwt.decode(req.body.accesstoken);

   if (decodedAccesstoken.phoneNumber !== decodedRefreshToken.phoneNumber)
      return res.status(400).send('Invalid tokens');

   const accesstoken = user.generateAuthAccessToken();
   user.refreshToken = user.generateAuthRefreshToken();
   user.lastLoginIp = req.ip;

   await user.save();

   res.header('x-auth-accesstoken', accesstoken)
      .header('x-auth-refreshtoken', user.refreshToken)
      .send(_.pick(user, ['_id', 'phoneNumber']));
});

module.exports = router;
