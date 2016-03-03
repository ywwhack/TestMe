'use strict';

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _babelFs = require('babel-fs');

var _babelFs2 = _interopRequireDefault(_babelFs);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _apn = require('apn');

var _apn2 = _interopRequireDefault(_apn);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _configure = require('./configure');

var _session = require('./session');

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _koaMulter = require('koa-multer');

var _koaMulter2 = _interopRequireDefault(_koaMulter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

// middleware


const router = (0, _koaRouter2.default)();
const upload = (0, _koaMulter2.default)({ dest: `${ _configure.rootPath }/uploads` });

const app = new _koa2.default();

router.get('/', (() => {
  var ref = _asyncToGenerator(function* (ctx, next) {
    const token = ctx.cookies.get('token');
    const filePath = token ? `${ _configure.templatePath }/message.html` : `${ _configure.templatePath }/upload.html`;
    ctx.body = yield _babelFs2.default.readFile(filePath);
    ctx.type = "html";
  }),
      _this = undefined;

  return function (_x, _x2) {
    return ref.apply(_this, arguments);
  };
})());

router.post('/profile', upload.any(), (() => {
  var ref = _asyncToGenerator(function* (ctx, next) {
    const uploadFiles = ctx.req.files;
    let token = ctx.cookies.get('token');
    if (!token) {
      token = _session.session.nextID;
      _session.session.nextID++;
    }
    let tokenObj = _session.session[token] = {};
    uploadFiles.forEach(function (file) {
      if (file.fieldname == 'key_pem') {
        tokenObj['keyFilePath'] = file.path;
      } else if (file.fieldname == 'cert_pem') {
        tokenObj['certFilePath'] = file.path;
      }
    });
    tokenObj['deviceToken'] = ctx.req.body['device_token'];
    tokenObj['passphrase'] = ctx.req.body['passphrase'];
    console.log(_session.session);

    ctx.cookies.set('token', token);
    ctx.redirect('/');
  }),
      _this = undefined;

  return function (_x3, _x4) {
    return ref.apply(_this, arguments);
  };
})());

router.post('/message', (() => {
  var ref = _asyncToGenerator(function* (ctx, next) {
    console.log('hehe');
    // TODO: replace this with middle ware
    ctx.req.setEncoding('utf8');
    ctx.req.on('data', function (data) {
      const token = ctx.cookies.get('token');
      data = JSON.parse(data);
      console.log(data);
      if (token) {
        const tokenObj = _session.session[token];
        const deviceToken = tokenObj['deviceToken']; //长度为64的设备Token，去除空格
        const options = {
          "cert": tokenObj['certFilePath'], //cert.pem文件的路径
          "key": tokenObj['keyFilePath'], //key.pem文件的路径
          "gateway": "gateway.sandbox.push.apple.com",
          "passphrase": tokenObj['passphrase'],
          "port": 2195
        };
        const apnConnection = new _apn2.default.Connection(options);
        const device = new _apn2.default.Device(deviceToken);
        const note = new _apn2.default.Notification();
        note.expiry = Math.floor(Date.now() / 1000) + 60;
        note.alert = data['alert'];
        note.sound = 'default';
        note.payload = { 'messageFrom': 'Caroline' };
        note.device = device;

        const badge = parseInt(data['badge']);
        if (badge != -1) {
          note.badge = badge;
        }

        apnConnection.pushNotification(note, device);

        ctx.body = 'success';
      } else {
        ctx.body = 'no token';
      }
    });
  }),
      _this = undefined;

  return function (_x5, _x6) {
    return ref.apply(_this, arguments);
  };
})());

app.use(router.routes()).use(router.allowedMethods());

const server = app.listen(3000, () => {
  console.log('listening on *:3000');
});

process.on('SIGINT', () => {
  server.close();
  _fs2.default.writeFileSync(_session.sessionFilePath, JSON.stringify(_session.session));
});