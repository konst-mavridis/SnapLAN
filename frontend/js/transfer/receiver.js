import { PacketType, parsePacket, buildPacket } from "./protocol.js";
export class FileReceiver {
    constructor(dataChannel) {
        this.dc = dataChannel;
        this.files = new Map();
        this.dc.binaryType = "arraybuffer";

    }
    handlePacket(packet) {
        switch (packet.type) {
            case PacketType.FILE_INFO:
                this.handleInfo(packet);
                break;
            
            case PacketType.FILE_CHUNK:
                this.handleChunk(packet);
                break;

            case PacketType.END:
                this.finishTransfer(packet.transferId);
                break;
        }
    }
    handleInfo(packet) {
        const info = JSON.parse(new TextDecoder().decode(packet.payload));
        this.files.set(packet.transferId, {
            info,
            chunks: [],
            received: 0
        });
        console.log("[FileReceiver] FILE_INFO", { transferId: packet.transferId, name: info.name, size: info.size, type: info.type });
    }
    handleChunk(packet) {
        const transfer = this.files.get(packet.transferId);
        if (!transfer) {
            console.warn('[FileReceiver] FILE_CHUNK but no transfer yet', { transferId: packet.transferId, sequence: packet.sequence });
            return;
        }
        transfer.chunks[packet.sequence] = packet.payload;
        transfer.received++;
        if (transfer.received % 10 === 0) {
            console.log('[FileReceiver] FILE_CHUNK', { transferId: packet.transferId, received: transfer.received, sequence: packet.sequence });
        }
        this.sendAck(packet.transferId, packet.sequence);
    }
    sendAck(id, sequence) {
        const packet = buildPacket({
            type: PacketType.ACK,
            transferId: id,
            sequence
        });
        this.dc.send(packet);
    }
    finishTransfer(id){
        const transfer = this.files.get(id);
        if (!transfer) {
            console.warn('[FileReceiver] END but no transfer yet', { transferId: id });
            return;
        }
        console.log('[FileReceiver] END', { transferId: id, name: transfer.info.name, receivedChunks: transfer.received });

        const blob = new Blob(transfer.chunks);

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = 'none';
        a.href = url;
        a.download = transfer.info.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.files.delete(id);
        console.log("[FileReceiver] Transfer finished:", transfer.info.name);
    }
}