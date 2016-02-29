'use strict';
const koa = require('koa');
const app = new koa();
const http = require('http').createServer(app.callback());
const io = require('socket.io')(http);
const bfs = require('babel-fs');
const fs = require('fs');
const qs = require('querystring');

// session
const s = require('./session');
let session = s.session;
const sessionFilePath = s.sessionFilePath;

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
  // console.log(ctx.req.files);
  let cookie = qs.parse(ctx.get('Cookie'));
  const uploadFiles = ctx.req.files;
  let token = cookie["token"];
  if(token) { // update session

  }else { // add to session
    token = session.nextID;
    let tokenObj = session[token] = {};
    uploadFiles.forEach(file => {
      if(file.fieldname == 'key_pem') {
        tokenObj['keyFilePath'] = file.path;
      }else if(file.fieldname == 'cert_pem') {
        tokenObj['certFilepath'] = file.path;
      }
    });
    tokenObj.deviceToken = ctx.req.body;
    console.log(session);
    cookie.token = token;
    ctx.set('Set-Cookie', qs.stringify(cookie));
  }

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

process.on('SIGINT', () => {
  fs.writeFileSync(sessionFilePath, JSON.stringify(session));
});