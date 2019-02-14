const fs = require('fs');
const path = require('path');

const getFileName = () => {
   return path.join(__dirname, `../logs/${process.env.startTime}.log`);
};

const info = (title, message) => {
   console.log('\x1b[44m%s\x1b[0m', `INFO::: ${title} - ${message}`);

   fs.appendFile(
      getFileName(),
      `{"type": "INFO", "date": "${Date.now()}", "title": "${title}", "message": "${message}"},\n`,
      err => {
         if (err)
            console.log(
               'something bad happend in File-System module located in services/logger.js'
            );
      }
   );
};

const error = (title, error) => {
   console.log('\x1b[41m%s\x1b[0m', `ERROR::: ${title} - ${error.message}`);

   fs.appendFile(
      getFileName(),
      `{"type": "ERROR", "date": "${Date.now()}", "title": "${title}", "message": "${
         error.message
      }", "stack": ${JSON.stringify(error.stack.split('\n'), null, ' ')}},\n`,
      err => {
         if (err)
            console.log(
               'something bad happend in File-System module located in services/logger.js'
            );
      }
   );
};

module.exports = {
   info,
   error
};
