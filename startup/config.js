const config = require('config');

module.exports = function() {
   if (!config.get('jwtAccessTokenPrivateKey') || !config.get('jwtRefreshTokenPrivateKey') || !config.get('jwtVeriyPhoneNumberPrivateKey')) {
      throw new Error('FATAL ERROR: jwtPrivateKeys are not defined.');
   }
};
