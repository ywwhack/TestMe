'use strict';

import koa from 'koa';
import bfs from 'babel-fs';
import fs from 'fs';
import qs from 'querystring';
import apn from 'apn';
import path from 'path';

import {rootPath} from './configure';
import {session, sessionFilePath} from './session';

// middleware
import koaRouter from 'koa-router';
import multer from 'koa-multer';
const router = koaRouter();
const upload = multer({dest: `${rootPath}/uploads`});

const app = new koa();

router.get('/', async function(ctx, next) {
  const filePath = `${rootPath}/index.html`;
  ctx.body = await bfs.readFile(filePath);
  ctx.type = "html";
});

router.post('/profile', upload.any(), async function(ctx, next) {
  const uploadFiles = ctx.req.files;
  let token = ctx.cookies.get('token');
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

  ctx.cookies.set('token', token);
  ctx.body = "";
});

router.post('/message', async function(ctx, next) {
  // TODO: replace this with middle ware
  ctx.req.setEncoding('utf8');
  ctx.req.on('data', (data) => {
    let token = ctx.cookies.get('token');
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

const server = app.listen(3000, function(){
  console.log('listening on *:3000');
});

process.on('SIGINT', () => {
  server.close();
  fs.writeFileSync(sessionFilePath, JSON.stringify(session));
});