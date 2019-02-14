const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
   const accesstoken = req.header('x-auth-accesstoken');
   if (!accesstoken)
      return res.status(401).send('Access denied. No token provided.');

   try {
      const decoded = jwt.verify(accesstoken, config.get('jwtAccessTokenPrivateKey'));
      req.user = decoded;
      next();
   } catch (error) {
      res.status(400).send('Invalid token.');
   }
};
