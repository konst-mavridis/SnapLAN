import { getBackendHost, getBackendBaseUrl } from '../config.js';
import { log } from '../logger.js';
import { state } from '../state.js';
import { connectToPeer, cleanupPeer } from '../network/webrtc.js';
import { createSession } from '../network/discovery.js';
import { connectWs } from '../network/websocket.js';

export function renderPeers(peerList) {
    const container = document.getElementById('peers');
    if (!container) return;

    const alive = new Set();
    state.peers = {};

    const weKnowOurId = typeof state.myPeerId === 'string' && state.myPeerId.length > 0;

    peerList.forEach(peer => {
        if (peer.id === state.myPeerId) return;

        alive.add(peer.id);
        state.peers[peer.id] = peer;

        let card = document.getElementById(`peer-${peer.id}`);
        const isFresh = !card;

        if (!card) {
            card = document.createElement('div');
            card.id = `peer-${peer.id}`;
            container.appendChild(card);
        }

        card.onclick = () => connectToPeer(peer.id);
        card.innerHTML = `<b>${peer.name}</b><br><small>${peer.id}</small>`;

        // Auto-connect to reduce manual clicks
        if (isFresh && !state.peerConnections[peer.id]) {
            if (!weKnowOurId) {
                log('[renderPeers] myPeerId not known yet; skipping auto-connect');
                return;
            }

            // Lexicographic tie-break
            if (state.myPeerId < peer.id) connectToPeer(peer.id);
        }
    });

    [...container.children].forEach(child => {
        const id = child.id.replace('peer-', '');
        if (!alive.has(id)) child.remove();
    });
}

export function renderDiscovered(devices) {
    const container = document.getElementById('discovered');
    if (!container) return;

    const host = getBackendHost();
    const alive = new Set();

    devices.forEach(d => {
        if (d.ip === host) return;

        const key = `${d.ip}:${d.port}`;
        alive.add(key);

        let card = document.getElementById(`discovered-${key}`);
        if (!card) {
            card = document.createElement('div');
            card.id = `discovered-${key}`;
            card.style.background = '#2a2a2a';
            card.style.padding = '8px';
            card.style.margin = '4px';
            card.style.borderRadius = '6px';
            card.style.borderLeft = '4px solid #4CAF50';
            container.appendChild(card);
        }

        card.innerHTML = `<b>${d.name}</b><br><small>${d.ip}:${d.port}</small>`;

        card.onclick = async () => {
            log(`🔗 Connecting to ${d.name} (${d.ip})...`);
            const ipInput = document.getElementById('ip');
            if (ipInput) ipInput.value = d.ip;

            await createSession();
            connectWs();
        };

        card.onmouseover = () => {
            card.style.background = '#3a3a';
        };
    });

    [...container.children].forEach(child => {
        const key = child.id.replace('discovered-', '');
        if (!alive.has(key)) child.remove();
    });
}

export function startScanner() {
    const scanner = new Html5Qrcode('reader');

    Html5Qrcode.getCameras().then(devices => {
        const cam = devices[0];

        scanner.start(
            cam.id,
            { fps: 10, qrbox: 250 },
            (text) => {
                log(`📷 QR: ${text}`);
                state.sessionId = text.split('/').pop();

                scanner.stop().catch(() => {});
                connectWs();
            }
        );
    });
}


