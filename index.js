const express = require('express');
const app = express();
const config = require('config');
const logger = require('./services/logger');

require('./startup/logConfiguration')();
require('./startup/product')(app);
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();

const port = config.get('PORT');
app.listen(port, () =>
   logger.info('Express started to listen', `Listening on port ${port}`)
);
