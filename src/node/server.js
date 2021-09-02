const net = require('net');
const moment = require("moment");
const protos = require('../proto/simple-time-pb');
const TcpSocket = require('./tcp-socket');

const HOST = '127.0.0.1';
const PORT = 8090;

class TcpServer {
    constructor() {
        this.server = null;
    }

    start(host, port) {
        this.server = net.createServer();

        this.server.listen(port, host);
        console.log(`Server listening on ${HOST}:${PORT}`);

        this.server.on('connection', (socket) => {
            console.log(`[CONNECTED]\t\tconnected from ${socket.remoteAddress}:${socket.remotePort}`);

            const client = new TcpSocket();

            client.on('message', (packBuffer) => {
                this.handlePackage(client, packBuffer);
            });

            client.on('end', () => {
                console.log(`[DISCONNECTED]\t\tdisconnected from ${socket.remoteAddress}:${socket.remotePort}`);
            });

            client.on('close', () => {
                console.log(`[CLOSED]\t\tclosed from ${socket.remoteAddress}:${socket.remotePort}`);
            });

            client.on('error', (err) => {
                console.error(err);
            });

            client.accept(socket);
        });
    }

    handlePackage(client, packBuffer) {
        const idx = packBuffer.readUInt16BE();
        const protoId = packBuffer.readUInt16BE(2);
        const msg = protos.EchoTime.deserializeBinary(packBuffer.slice(4));
        this.handleMessage(client, idx, protoId, msg);
    }

    handleMessage(client, idx, protoId, msg) {
        console.log(idx, protoId, msg.getLocaltime());
        const resp = new protos.EchoTime();
        const str = `server response ${moment().format('YYYY-MM-DD HH:mm:ss')}`;
        resp.setLocaltime(str);
        const msgBuf = Buffer.from(resp.serializeBinary());
        const headBuf = Buffer.alloc(2);
        headBuf.writeUInt16BE(msgBuf.length + 4);
        const idxBuf = Buffer.alloc(2);
        idxBuf.writeUInt16BE(idx);
        const cmdBuf = Buffer.alloc(2);
        cmdBuf.writeUInt16BE(protos.ProtoId.ECHO_TIME);
        const pkgBuf = Buffer.concat([headBuf, idxBuf, cmdBuf, msgBuf]);
        client.write(pkgBuf.toString('binary'));
    }
}

const tcpServer = new TcpServer();

tcpServer.start(HOST, PORT);