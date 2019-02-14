process.env.startTime = Date.now();

require('express-async-errors');

const logger = require('../services/logger');

module.exports = function() {
   process.on('uncaughtException', error => {
      logger.error('uncaughtException', error);
   });

   process.on('unhandledRejection', error => {
      logger.error('unhandledRejection', error);
   });
};
