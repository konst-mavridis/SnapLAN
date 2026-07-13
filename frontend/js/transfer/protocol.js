export const PROTOCOL_VERSION = 1;
export const HEADER_SIZE = 32;

export const PacketType = {
    HELLO: 0x01,
    FILE_INFO: 0x02,
    FILE_CHUNK: 0x03,
    ACK: 0x04,
    END: 0x05,
    CANCEL: 0x06,
    PAUSE: 0x07,
    RESUME: 0x08,
    KEEPALIVE: 0x09,
}

export const uuidToBytes = (uuid) => {
    const hex = uuid.replace(/-/g, "");
    const bytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}

export function bytesToUuid(bytes) {
    const hex = [...bytes]
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
    return [
        hex.substring(0,8),
        hex.substring(8,12),
        hex.substring(12,16),
        hex.substring(16,20),
        hex.substring(20)
    ].join("-");
}

let crcTable = null;
function buildTable() {
    crcTable = new Uint32Array(256);
    for(let i=0; i<256; i++){
        let c = i;
        for(let j=0; j<8; j++) {
             c = (c&1) ? 0xEDB88320^(c>>>1) : (c>>>1);
        }
        crcTable[i]=c>>>0;
    }
}
export function crc32(buffer) {
    if(!crcTable) buildTable();
    let crc = 0xFFFFFFFF;
    const bytes = new Uint8Array(buffer);
    for(const b of bytes) {
        crc = crcTable[(crc^b)&0xFF] ^(crc>>>8);
    }
    return (~crc)>>>0;
}

export function buildPacket({
    type, transferId, sequence = 0, flags = 0, payload = new Uint8Array()
}) {
    if(!(payload instanceof Uint8Array)) 
        payload = new Uint8Array(payload);

    const packet = new Uint8Array(
        HEADER_SIZE + payload.length
    );
    const view = new DataView(packet.buffer);
    packet[0] = PROTOCOL_VERSION;
    packet[1] = type;
    packet[2] = flags;
    packet[3] = 0;
    packet.set(uuidToBytes(transferId), 4);
    view.setUint32(20, sequence);
    view.setUint32(24, payload.length);
    packet.set(payload, HEADER_SIZE);
    const crc = crc32(packet);
    view.setUint32(28, crc);
    return packet.buffer;
}

export function parsePacket(buffer) {
    const packet = new Uint8Array(buffer);
    const view = new DataView(packet.buffer);
    const version = packet[0];
    const type = packet[1];
    const flags = packet[2];
    const transferId = bytesToUuid(packet.slice(4, 20));
    const sequence = view.getUint32(20);
    const length = view.getUint32(24);
    const crc = view.getUint32(28);
    const payload = packet.slice(HEADER_SIZE, HEADER_SIZE + length);
    const packetForCrc = packet.slice(0, HEADER_SIZE + length);
    packetForCrc[28] = 0;
    packetForCrc[29] = 0;
    packetForCrc[30] = 0;
    packetForCrc[31] = 0;
    const computed = crc32(packetForCrc);
    return {
        version, type, flags, transferId, sequence, length, crc, payload, valid: computed === crc
    };
}

export function encodeString(str) {
    return new TextEncoder().encode(str);
}
export function decodeString(bytes){
    return new TextDecoder().decode(bytes);
}

