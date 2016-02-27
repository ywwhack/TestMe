'use strict';
const apn=require('apn');
const token ='44efd103898ae56dc64c9db8d7cab896864502bd4578304d4a75550046417371'; //长度为64的设备Token，去除空格
const options = {
    "cert": "PushChatCert.pem", //cert.pem文件的路径
    "key": "PushChatKey.pem",   //key.pem文件的路径
    "gateway": "gateway.sandbox.push.apple.com",
    "passphrase": "hxqz8231777",
    "port": 2195},
    apnConnection = new apn.Connection(options),
    device = new apn.Device(token);

/*note.expiry = Math.floor(Date.now() / 1000) + 60;
note.badge = 0;
note.alert = 'test APNS ';
note.sound = 'default';
note.payload = {'messageFrom': 'Caroline'};
note.device = device;*/

exports.connenction = apnConnection;
exports.device = device;
exports.apn = apn;