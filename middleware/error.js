const logger = require('../services/logger');

module.exports = function(error, req, res, next) {
   logger.error('Something failed', error);

   res.status(500).send('Something failed.');
};
