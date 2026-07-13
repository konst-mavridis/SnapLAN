import { getBackendHost, getBackendPort } from '../config.js';
import { log, setStatus } from '../logger.js';
import { state } from '../state.js';
import { renderPeers, renderDiscovered } from '../ui/render.js';
import { cleanupPeer } from './webrtc.js';
import { handleOffer, handleAnswer, handleICE } from './webrtc.js';

let ws = null;

function sendWs(payload) {
  if (!ws) return;
  if (ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify(payload));
}

window.addEventListener('ws:send', (e) => {
  // e.detail is the message object to send
  if (e && e.detail) sendWs(e.detail);
});

export function connectWs() {
  if (!state.sessionId) {
    log('No sessionId yet.');
    return;
  }

  const host = getBackendHost();
  const port = getBackendPort();

  if (ws) {
    try { ws.close(); } catch (_) {}
  }

  ws = new WebSocket(`wss://${host}:${port}/ws`);

  setStatus('Connecting...');

  ws.onopen = () => {
    log('[ws] OPEN');

    ws.send(JSON.stringify({
      type: 'ClientHello',
      device_name: `Browser (${navigator.platform})`,
      session_id: state.sessionId
    }));

    const pingBtn = document.getElementById('pingBtn');
    if (pingBtn) pingBtn.disabled = false;

    setStatus(`Connected as ${navigator.platform}`);
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === 'PeerJoined') {
      state.myPeerId = msg.peer_id;
    }

    if (msg.type === 'peer_list') renderPeers(msg.data);
    if (msg.type === 'discovery_list') renderDiscovered(msg.data);

    if (msg.type === 'peer_online') {
      log(`[ws] peer_online: ${msg.data.name}`);
    }

    if (msg.type === 'peer_offline') {
      cleanupPeer(msg.data.id);
    }

    if (msg.type === 'Offer' && msg.to === state.myPeerId) handleOffer(msg);
    if (msg.type === 'Answer' && msg.to === state.myPeerId) handleAnswer(msg);
    if (msg.type === 'IceCandidate' && msg.to === state.myPeerId) handleICE(msg);
  };

  ws.onerror = () => {
    setStatus('WS Error');
  };

  ws.onclose = () => {
    setStatus('Disconnected');
    const pingBtn = document.getElementById('pingBtn');
    if (pingBtn) pingBtn.disabled = true;
  };
}

export function ping() {
  if (!ws) return;
  if (ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify({ type: 'Ping' }));
}

// Heartbeat loop
setInterval(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'Heartbeat' }));
  }
}, 5000);

