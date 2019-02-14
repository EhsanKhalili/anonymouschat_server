const mongoose = require('mongoose');
const logger = require('../services/logger');

module.exports = function() {
   mongoose
      .connect('mongodb://localhost:27017/anonymouschat', {
         useNewUrlParser: true,
         useCreateIndex: true,
         autoReconnect: true
      })
      .then(() => logger.info('MongoDB connection', 'Connected to MongoDB'));
};
