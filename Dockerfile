FROM daocloud.io/node:6.2.1

MAINTAINER sfreee <sfreee@qq.com>

RUN mkdir -p /opt/mfs

RUN npm install -g pm2

WORKDIR /opt/mfs

COPY ./package.json /opt/mfs/

RUN npm install

COPY . /opt/mfs/

VOLUME /data/mfs

ENV NODE_ENV dev

EXPOSE 8080

ENTRYPOINT pm2 start process.json --no-daemon
