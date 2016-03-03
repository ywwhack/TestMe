'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sessionFilePath = exports.session = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _configure = require('./configure');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const sessionFilePath = `${ _configure.rootPath }/session.json`;

try {
  _fs2.default.accessSync(sessionFilePath);
} catch (e) {
  _fs2.default.writeFileSync(sessionFilePath, JSON.stringify({ "nextID": "0" }));
}

const sessionString = _fs2.default.readFileSync(sessionFilePath, 'utf8');

const session = exports.session = JSON.parse(sessionString);
exports.sessionFilePath = sessionFilePath;