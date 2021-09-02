import {sleep} from 'k6'
import K6TcpClient from "./k6-tcp-client";

const HOST = '127.0.0.1';
const PORT = 8090;
let client = null;

export default function () {
    if (!client) {
        client = new K6TcpClient();
        client.connect(HOST, PORT);
    } else {
        client.sendMessage();
    }
    sleep(1);
}