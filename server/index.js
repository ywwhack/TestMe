'use strict';
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const apnConfigure = require('./apnConfigure');

const apn = apnConfigure.apn;
const device = apnConfigure.device;
const apnConnection = apnConfigure.connenction;

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
  socket.on('message', (data) => {
    console.log(data);
    const note = new apn.Notification();
    note.alert = "this is test";
    note.sound = "default";
    note.device = device;
    apnConnection.pushNotification(note, device);
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});