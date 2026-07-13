import { FileSender } from './sender.js';
import { FileReceiver } from './receiver.js';
import { PacketType, parsePacket } from './protocol.js';
export class TransferManager {
    constructor(dataChannel) {
        this.dc = dataChannel;
        this.sender = new FileSender(dataChannel);
        this.receiver = new FileReceiver(dataChannel);
        this.dc.binaryType = "arraybuffer";
        this.dc.onmessage = (e) => {
            console.log('[TransferManager] onmessage', { typeof: typeof e.data, isArrayBuffer: e.data instanceof ArrayBuffer, byteLength: e.data && e.data.byteLength });
            const packet = parsePacket(e.data)
            if (!packet.valid) {
                console.warn('[TransferManager] invalid packet crc', { transferId: packet.transferId, type: packet.type, sequence: packet.sequence, length: packet.length, crc: packet.crc });
            }
            switch(packet.type) {
                case PacketType.ACK:
                    this.sender.handleAck(packet);
                    break;

                case PacketType.FILE_INFO:
                case PacketType.FILE_CHUNK:
                case PacketType.END:
                    this.receiver.handlePacket(packet)
                    break;
            }
        };
    }
    async send(file) {
        return this.sender.send(file);
    }
}