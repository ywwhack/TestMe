'use strict';
const koa = require('koa');
const app = new koa();
const http = require('http').createServer(app.callback());
const bfs = require('babel-fs');
const fs = require('fs');
const qs = require('querystring');
const apn=require('apn');

// session
const s = require('./session');
let session = s.session;
const sessionFilePath = s.sessionFilePath;

// middle ware
const router = require('koa-router')();
const multer = require('koa-multer');
const upload = multer({dest: 'uploads'});

router.get('/', async function(ctx, next) {
  const filePath = `${__dirname}/index.html`;
  ctx.body = await bfs.readFile(filePath);
  ctx.type = "html";
});

router.post('/profile', upload.any(), async function(ctx, next) {
  let cookie = qs.parse(ctx.get('Cookie'));
  const uploadFiles = ctx.req.files;
  let token = cookie['token'];
  if(!token) {
    token = session.nextID;
    session.nextID++;
  }
  let tokenObj = session[token] = {};
  uploadFiles.forEach(file => {
    if(file.fieldname == 'key_pem') {
      tokenObj['keyFilePath'] = file.path;
    }else if(file.fieldname == 'cert_pem') {
      tokenObj['certFilePath'] = file.path;
    }
  });
  tokenObj['deviceToken'] = ctx.req.body['device_token'];
  tokenObj['passphrase'] = ctx.req.body['passphrase'];
  console.log(session);

  cookie.token = token;
  ctx.set('Set-Cookie', qs.stringify(cookie));
  ctx.body = "";
});

router.post('/message', async function(ctx, next) {
  // TODO: replace this with middle ware
  ctx.req.setEncoding('utf8');
  ctx.req.on('data', (data) => {
    console.log(data);
    let token = qs.parse(ctx.get('Cookie'))['token'];
    if(token) {
      const tokenObj = session[token];
      const deviceToken = tokenObj['deviceToken']; //长度为64的设备Token，去除空格
      const options = {
        "cert": tokenObj['certFilePath'], //cert.pem文件的路径
        "key": tokenObj['keyFilePath'],   //key.pem文件的路径
        "gateway": "gateway.sandbox.push.apple.com",
        "passphrase": tokenObj['passphrase'],
        "port": 2195
      };
      const apnConnection = new apn.Connection(options);
      const device = new apn.Device(deviceToken);
      const note = new apn.Notification();
      note.expiry = Math.floor(Date.now() / 1000) + 60;
      note.badge = 0;
      note.alert = JSON.parse(data)['message'];
      note.sound = 'default';
      note.payload = {'messageFrom': 'Caroline'};
      note.device = device;
      apnConnection.pushNotification(note, device);

      ctx.body = 'success';
    }else {
      ctx.body = 'no token';
    }
  });
});

app
  .use(router.routes())
  .use(router.allowedMethods());

http.listen(3000, function(){
  console.log('listening on *:3000');
});

process.on('SIGINT', () => {
  http.close();
  fs.writeFileSync(sessionFilePath, JSON.stringify(session));
});