const EventEmitter = require('events');

class TcpSocket extends EventEmitter {
    constructor() {
        super();
        this.socket = null;
        this.buffer = Buffer.alloc(512);
        this.bufferOffset = 0;
        this.totalBufferLength = 512;
        this.curBufferLength = 0;
        this.packageLength = 0;
        this.connectFunc = null;
        this.dataPreFunc = null;
    }

    accept(socket) {
        this.socket = socket;
        this.init();
    }

    connect(socket, host, port) {
        this.socket = socket;
        this.init();
        if (!this.connectFunc) {
            this.socket.connect(port, host, () => {
                this.emit('connect');
            });
        } else {
            this.connectFunc();
            this.emit('connect');
        }
    }

    write(data) {
        this.socket.write(data);
    }

    bindConnectFunc(func) {
        if (func) {
            this.connectFunc = func;
        }
    }

    bindDataPreFunc(func) {
        if (func) {
            this.dataPreFunc = func;
        }
    }

    init() {
        if (!this.socket) {
            throw new Error('socket is undefined!');
        }
        this.socket.on('data', (chunk) => {
            if (this.dataPreFunc) {
                chunk = this.dataPreFunc(chunk);
            }
            this.handleData(chunk);
        });

        this.socket.on('end', () => {
            this.emit('end');
        });

        this.socket.on('close', () => {
            this.emit('close');
        });

        this.socket.on('error', (err) => {
            this.emit('error', err);
        });
    }

    handleData(chunk) {
        if (!chunk) {
            return;
        }
        chunk = Buffer.from(chunk);
        const chunkLength = chunk.length;
        const availableBufferLen = this.totalBufferLength - this.curBufferLength;
        if (availableBufferLen < chunkLength) {
            const unParseLen = this.curBufferLength - this.bufferOffset;
            const newBufferLen = Math.max(unParseLen + chunkLength, 512);
            const newBuffer = Buffer.alloc(newBufferLen);
            this.buffer.copy(newBuffer, 0, this.bufferOffset, this.curBufferLength);
            this.bufferOffset = 0;
            this.totalBufferLength = newBufferLen;
            this.curBufferLength = unParseLen;
            this.buffer = newBuffer;
        }
        chunk.copy(this.buffer, this.curBufferLength);
        this.curBufferLength += chunkLength;
        this.onReadPackage();
    }

    onReadPackage() {
        if (this.packageLength == 0) {
            if (this.curBufferLength - this.bufferOffset < 2) {
                return;
            }
            this.packageLength = this.buffer.readUInt16BE(this.bufferOffset);
            this.bufferOffset += 2;
        }
        if (this.curBufferLength - this.bufferOffset < this.packageLength) {
            return;
        }
        const packageBuffer = Buffer.alloc(this.packageLength);
        this.buffer.copy(packageBuffer, 0, this.bufferOffset, this.bufferOffset + this.packageLength);
        this.bufferOffset += this.packageLength;
        this.packageLength = 0;
        this.emit('message', packageBuffer);
        this.onReadPackage();
    }
}

module.exports = TcpSocket;