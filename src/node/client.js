const net = require('net');
const moment = require('moment');
const protos = require('../proto/simple-time-pb');
const TcpSocket = require('./tcp-socket');

const HOST = '127.0.0.1';
const PORT = 8090;

class TcpClient {
    constructor() {
        this.client = null;
        this.msgIdx = 0;
    }

    start(host, port) {
        this.client = new TcpSocket();

        this.client.on('connect', () => {
            setInterval(this.sendMessage.bind(this), 2 * 2000);
        });

        this.client.on('message', (pkgBuffer) => {
            this.handlePackage(pkgBuffer);
        });

        this.client.on('end', () => {
            console.log(`[DISCONNECTED]\tconnection disconnected`);
        });

        this.client.on('close', () => {
            console.log(`[CLOSED]\tconnection closed`);
        });

        this.client.on('error', (err) => {
            console.error(err);
            process.exit();
        });

        const socket = new net.Socket();
        this.client.connect(socket, host, port);
    }

    sendMessage() {
        // 消息体
        const msg = new protos.EchoTime();
        const str = `client request ${moment().format('YYYY-MM-DD HH:mm:ss')}`;
        msg.setLocaltime(str);
        const msgBuf = Buffer.from(msg.serializeBinary());
        // 消息长度
        const headBuf = Buffer.alloc(2);
        headBuf.writeUInt16BE(msgBuf.length + 4);
        // 消息处理序列
        const idxBuf = Buffer.alloc(2);
        idxBuf.writeUInt16BE(this.getMessageIdx());
        // 协议号
        const protoBuf = Buffer.alloc(2);
        protoBuf.writeUInt16BE(protos.ProtoId.ECHO_TIME);

        const pkgBuf = Buffer.concat([headBuf, idxBuf, protoBuf, msgBuf]);
        this.client.write(pkgBuf.toString('binary'));
    }

    getMessageIdx() {
        return this.msgIdx++ % 65534;
    }

    handlePackage(packBuffer) {
        const idx = packBuffer.readUInt16BE();
        const protoId = packBuffer.readUInt16BE(2);
        const msg = protos.EchoTime.deserializeBinary(packBuffer.slice(4));
        this.handleMessage(idx, protoId, msg);
    }

    handleMessage(idx, protoId, msg) {
        console.log(idx, protoId, msg.getLocaltime());
    }
}

const client = new TcpClient();

client.start(HOST, PORT);
