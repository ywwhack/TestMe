'use strict';

import fs from 'fs';
import {rootPath} from './configure';
const sessionFilePath = `${rootPath}/session.json`;

try {
  fs.accessSync(sessionFilePath);
}catch(e) {
  fs.writeFileSync(sessionFilePath, JSON.stringify({"nextID": "0"}));
}

const sessionString = fs.readFileSync(sessionFilePath, 'utf8');

export const session = JSON.parse(sessionString);
export {sessionFilePath};