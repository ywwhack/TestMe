'use strict';

export async function body(ctx, next) {
  if(ctx.method == 'POST') {
    ctx.body = await new Promise((resolve, reject) => {
      ctx.req.on('data', (data) => {
        resolve(JSON.parse(data.toString()));
      });
    });
    await next();
  }else {
    await next();
  }
};