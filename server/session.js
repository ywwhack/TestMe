'use strict';

const fs = require('fs');
const sessionFilePath = `${__dirname}/session.json`;

try {
  fs.accessSync(sessionFilePath);
}catch(e) {
  fs.writeFileSync(sessionFilePath, JSON.stringify({"nextID": "0"}));
}

const session = fs.readFileSync(sessionFilePath, 'utf8');
console.log(typeof JSON.parse(session));
exports.session = JSON.parse(session);
exports.sessionFilePath = sessionFilePath;