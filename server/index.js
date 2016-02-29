'use strict';
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cookieParser = require('cookie-parser');
const multer = require('multer');
const upload = multer({dest: 'uploads'});
const apnConfigure = require('./apnConfigure');

const apn = apnConfigure.apn;
const device = apnConfigure.device;
const apnConnection = apnConfigure.connenction;

app.use(cookieParser());

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.get('/profile', (req, res) => {
  // res.cookie('name', 'hehe');
  res.sendfile('profile.html');
  console.log(req.cookies);
});

app.post('/profile', upload.any(), (req, res) => {
  console.log(req.files);
  res.end();
});

io.on('connection', function(socket) {
  socket.on('message', (data) => {
    console.log(data);
    const note = new apn.Notification();
    note.alert = data;
    note.sound = "default";
    note.device = device;
    apnConnection.pushNotification(note, device);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});