'use strict';
const koa = require('koa');
const app = new koa();
const http = require('http').createServer(app.callback());
const io = require('socket.io')(http);
const bfs = require('babel-fs');

// middle ware
const router = require('koa-router')();
const multer = require('koa-multer');
const upload = multer({dest: 'uploads'});

// apn configure
const apnConfigure = require('./apnConfigure');
const apn = apnConfigure.apn;
const device = apnConfigure.device;
const apnConnection = apnConfigure.connenction;

router.get('/', async function(ctx, next) {
  const filePath = `${__dirname}/index.html`;
  ctx.body = await bfs.readFile(filePath);
  ctx.type = "html";
});

router.post('/profile', upload.any(), async function(ctx, next) {
  console.log(ctx.req.files);
  ctx.body = "";
});

app
  .use(router.routes())
  .use(router.allowedMethods());

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