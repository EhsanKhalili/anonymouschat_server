const path = require('path');
const express = require('express');
const users = require('../routes/users');
const error = require('../middleware/error');

module.exports = function(app) {
   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));
   app.use(express.static(path.join(__dirname, '../public/')));

   app.use('/api/users', users);
   app.use(error);
};
