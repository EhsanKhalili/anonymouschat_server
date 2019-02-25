const express = require('express');
const app = express();
const socketio = require('socket.io');

const port = 3000;
const server = app.listen(port, () =>
   console.log('App listening on port ' + port)
);

const websocket = socketio(server); //Initiate Socket

websocket.on('channel1', data => {
   console.log('Greetings from RN app', data);
});

websocket.emit('channel2', 'new channel');

websocket.on('channel2', obj => {
   console.log('Object from RN app', obj);
});
