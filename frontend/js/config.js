// Global/shared state is defined elsewhere; avoid redeclaring `ws`.
// Keep only config helpers here.

let sessionId = null;
let peers = {};
let peerConnections = {};
let dataChannels = {};
let myPeerId = null;
let incomingFiles = {};
let sendQueue = {};

const ICE_SERVERS = [
    { urls: "stun:stun.relay.metered.ca:80" },
    {
        urls: "turn:global.relay.metered.ca:80",
        username: "e8dd65b92c62d3e36c99f931",     // FIXED: was "e8dd65b92c62d3e36c99f31" - missing a "9", mistyped during transcription
        credential: "uWdWNmkhvyqTEswO"             // FIXED: key was "credentials" (plural) - RTCIceServer requires "credential" (singular), so auth was silently ignored. Also fixed trailing char: capital letter "O", not digit "0".
    },
    {
        urls: "turn:global.relay.metered.ca:443",
        username: "e8dd65b92c62d3e36c99f931",
        credential: "uWdWNmkhvyqTEswO"
    },
    {
        urls: "turn:global.relay.metered.ca:443?transport=tcp",
        username: "e8dd65b92c62d3e36c99f931",
        credential: "uWdWNmkhvyqTEswO"
    },
];

export function getBackendHost() {
    // If user explicitly typed an IP/host, use it.
    const input = document.getElementById("ip");
    if (input && input.value.trim()) return input.value.trim();

    // Otherwise: use the host serving this page.
    // This makes phone loads work regardless of how the page was accessed.
    return window.location.hostname;
}

export function getBackendPort() {
    // If user explicitly typed a host, keep using backend port 3000.
    // Otherwise derive port from current origin.
    const input = document.getElementById("ip");
    if (input && input.value.trim()) return "3000";

    // location.port is "" when default port is used.
    return window.location.port || "3000";
}

export function getBackendBaseUrl() {
    const host = getBackendHost();
    const port = getBackendPort();
    return `https://${host}:${port}`;
}

