import {
    PacketType,
    buildPacket,
    encodeString
} from "./protocol.js";
const CHUNK_SIZE = 16 * 1024; // 64KB
const WINDOW_SIZE = 5;
export class FileSender {
    constructor(dataChannel){
        this.dc = dataChannel;
        this.transferId = null;
        this.pending = new Map();
        this.sequence = 0;
        this.dc.binaryType = "arraybuffer";

    }
    async send(file) {
        this.transferId = crypto.randomUUID();
        this.sequence = 0;
        console.log("[FileSender] Starting transfer", this.transferId);
        await this.sendFileInfo(file);
        await this.sendChunks(file);
        this.sendEnd();
        console.log("[FileSender] Transfer finished", this.transferId);
    }
    async sendFileInfo(file){
        const info = {
            name: file.name,
            size: file.size,
            type: file.type,
        };
        const payload = encodeString(JSON.stringify(info));
        const packet = buildPacket({
            type: PacketType.FILE_INFO,
            transferId: this.transferId,
            payload
        });
        this.dc.send(packet);
    }
    async sendChunks(file){
        let offset = 0;
        while (offset < file.size) {
            while(this.pending.size >= WINDOW_SIZE){
                await this.waitForAck();
            }
            const blob = file.slice(offset, offset + CHUNK_SIZE);
            const buffer = await blob.arrayBuffer();
            const packet = buildPacket({
                type: PacketType.FILE_CHUNK,
                transferId: this.transferId,
                sequence: this.sequence,
                payload: new Uint8Array(buffer)
            });
            this.dc.send(packet);
            this.pending.set(this.sequence, Date.now());
            offset += CHUNK_SIZE;
            this.sequence++;
        }
        while(this.pending.size > 0) {
            await this.waitForAck();
        }
    }
    sendEnd(){
        const packet = buildPacket({
            type: PacketType.END,
            transferId: this.transferId
        });
        this.dc.send(packet);
    }
    handleAck(packet){
        if (packet.type === PacketType.ACK) {
            this.pending.delete(packet.sequence);
        }
    }
    waitForAck(){
        return new Promise(resolve => {
            const timer = setInterval(() => {
                if(this.pending.size < WINDOW_SIZE){
                    clearInterval(timer);
                    resolve();
                }
            },10);
        });
    }
}
