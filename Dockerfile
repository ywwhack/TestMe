FROM    node:5.7.1

# Install app dependencies
COPY package.json /apntest/package.json
RUN cd /apntest; npm install --production

# Bundle app source
COPY . /apntest

EXPOSE  3000
CMD ["node", "/apntest/lib/index.js"]