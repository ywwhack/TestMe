'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

let body = exports.body = function () {
  var ref = _asyncToGenerator(function* (ctx, next) {
    if (ctx.method == 'POST') {
      ctx.body = yield new Promise(function (resolve, reject) {
        ctx.req.on('data', function (data) {
          resolve(JSON.parse(data.toString()));
        });
      });
      yield next();
    } else {
      yield next();
    }
  });

  return function body(_x, _x2) {
    return ref.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

;