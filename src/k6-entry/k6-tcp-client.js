import tcp from 'k6/x/tcp'
import moment from "moment";
import TcpSocket from '../node/tcp-socket';
import protos from "../proto/simple-time-pb";

class K6TcpClient {
    constructor() {
        this.client = null;
        this.msgIdx = 0;
        this.isConnected = false;
    }

    connect(host, port) {
        this.client = new TcpSocket();
        const opts = {
            host: host,
            port: port
        };
        const socket = new tcp.Client();
        this.client.bindConnectFunc(socket.connect.bind(socket, opts));
        this.client.bindDataPreFunc(this.preData.bind(null));

        this.client.on('connect', () => {
            console.log(`[CONNECTED]\tconnection connected`);
            this.isConnected = true;
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
        });

        this.client.connect(socket);
    }

    sendMessage() {
        if (!this.isConnected) {
            return;
        }

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

    preData(chunk) {
        return chunk[0];
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

export default K6TcpClient;