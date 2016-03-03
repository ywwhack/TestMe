'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.templatePath = exports.rootPath = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rootPath = exports.rootPath = _path2.default.resolve(__dirname, '..');
const templatePath = exports.templatePath = `${ rootPath }/template`;