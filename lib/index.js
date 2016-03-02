'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const koa = require('koa');
const app = new koa();
const http = require('http').createServer(app.callback());
const bfs = require('babel-fs');
const fs = require('fs');
const qs = require('querystring');
const apn = require('apn');

// session
const s = require('./session');
let session = s.session;
const sessionFilePath = s.sessionFilePath;

// middle ware
const router = require('koa-router')();
const multer = require('koa-multer');
const upload = multer({ dest: '../uploads' });

router.get('/', function () {
  var ref = _asyncToGenerator(function* (ctx, next) {
    const filePath = `${ __dirname }/index.html`;
    ctx.body = yield bfs.readFile(filePath);
    ctx.type = "html";
  });

  return function (_x, _x2) {
    return ref.apply(this, arguments);
  };
}());

router.post('/profile', upload.any(), function () {
  var ref = _asyncToGenerator(function* (ctx, next) {
    const uploadFiles = ctx.req.files;
    let token = ctx.cookies.get('token');
    if (!token) {
      token = session.nextID;
      session.nextID++;
    }
    let tokenObj = session[token] = {};
    uploadFiles.forEach(function (file) {
      if (file.fieldname == 'key_pem') {
        tokenObj['keyFilePath'] = file.path;
      } else if (file.fieldname == 'cert_pem') {
        tokenObj['certFilePath'] = file.path;
      }
    });
    tokenObj['deviceToken'] = ctx.req.body['device_token'];
    tokenObj['passphrase'] = ctx.req.body['passphrase'];
    console.log(session);

    ctx.cookies.set('token', token);
    ctx.body = "";
  });

  return function (_x3, _x4) {
    return ref.apply(this, arguments);
  };
}());

router.post('/message', function () {
  var ref = _asyncToGenerator(function* (ctx, next) {
    // TODO: replace this with middle ware
    ctx.req.setEncoding('utf8');
    ctx.req.on('data', function (data) {
      console.log(data);
      let token = ctx.cookies.get('token');
      if (token) {
        const tokenObj = session[token];
        const deviceToken = tokenObj['deviceToken']; //长度为64的设备Token，去除空格
        const options = {
          "cert": tokenObj['certFilePath'], //cert.pem文件的路径
          "key": tokenObj['keyFilePath'], //key.pem文件的路径
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
        note.payload = { 'messageFrom': 'Caroline' };
        note.device = device;
        apnConnection.pushNotification(note, device);

        ctx.body = 'success';
      } else {
        ctx.body = 'no token';
      }
    });
  });

  return function (_x5, _x6) {
    return ref.apply(this, arguments);
  };
}());

app.use(router.routes()).use(router.allowedMethods());

http.listen(3000, function () {
  console.log('listening on *:3000');
});

process.on('SIGINT', () => {
  http.close();
  fs.writeFileSync(sessionFilePath, JSON.stringify(session));
});