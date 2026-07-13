import { log } from '../logger.js';
import { state } from '../state.js';
import { initTransferManager, getManagerForPeer } from '../transfer/transfer_manager_singleton.js';
import { connectWs } from './websocket.js';

const ICE_SERVERS = [
  { urls: 'stun:stun.relay.metered.ca:80' },
  {
    urls: 'turn:global.relay.metered.ca:80',
    username: 'e8dd65b92c62d3e36c99f931',
    credential: 'uWdWNmkhvyqTEswO'
  },
  {
    urls: 'turn:global.relay.metered.ca:443',
    username: 'e8dd65b92c62d3e36c99f931',
    credential: 'uWdWNmkhvyqTEswO'
  },
  {
    urls: 'turn:global.relay.metered.ca:443?transport=tcp',
    username: 'e8dd65b92c62d3e36c99f931',
    credential: 'uWdWNmkhvyqTEswO'
  },
];

export function createPeer(remoteId, isOfferer) {
  if (state.peerConnections[remoteId]) return state.peerConnections[remoteId];
  if (!state.sendQueue[remoteId]) state.sendQueue[remoteId] = [];

  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  state.peerConnections[remoteId] = pc;

  if (isOfferer) {
    const dc = pc.createDataChannel('snaplan', { ordered: true });
    setupChannel(remoteId, dc);
  } else {
    pc.ondatachannel = (e) => setupChannel(remoteId, e.channel);
  }

  pc.onicecandidate = (e) => {
    if (!e.candidate) return;

    // ws is handled inside websocket module; use DOM event? For now, rely on websocket module routing.
    // We import connectWs only to ensure ws exists; actual sending is done via websocket's ws.
    // Simplest: dispatch a CustomEvent and let websocket handle it.
    window.dispatchEvent(new CustomEvent('webrtc:ice', {
      detail: {
        candidate: JSON.stringify(e.candidate),
        from: state.myPeerId,
        to: remoteId,
      }
    }));
  };

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
      log(`[webrtc] Peer ${remoteId} state=${pc.connectionState}`);
    }
  };

  pc.oniceconnectionstatechange = () => {
    if (pc.iceConnectionState === 'failed') {
      log(`[webrtc] ICE failed for ${remoteId}`);
    }
  };

  return pc;
}

export function setupChannel(remoteId, dc) {
  dc.binaryType = 'arraybuffer';
  dc.bufferedAmountLowThreshold = 1024 * 1024;
  state.dataChannels[remoteId] = dc;

  getManagerForPeer(remoteId);

  dc.onopen = () => {
    const q = state.sendQueue[remoteId];
    if (q && q.length) {
      q.forEach(m => dc.send(JSON.stringify(m)));
      delete state.sendQueue[remoteId];
    }

    initTransferManager();
  };

  dc.onerror = (e) => console.error('[webrtc] DC error', e);

  dc.onclose = () => {
    delete state.dataChannels[remoteId];
  };
}

export async function connectToPeer(remoteId) {
  if (remoteId === state.myPeerId) return;

  const pc = createPeer(remoteId, true);

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  window.dispatchEvent(new CustomEvent('webrtc:signal', {
    detail: {
      type: 'Offer',
      from: state.myPeerId,
      to: remoteId,
      sdp: JSON.stringify(offer)
    }
  }));
}

export async function handleOffer(msg) {
  const pc = state.peerConnections[msg.from];

  if (pc && pc.signalingState === 'have-local-offer') {
    if (state.myPeerId < msg.from) {
      return;
    } else {
      await pc.setLocalDescription({ type: 'rollback' });
    }
  }

  const peer = createPeer(msg.from, false);
  await peer.setRemoteDescription(JSON.parse(msg.sdp));

  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);

  window.dispatchEvent(new CustomEvent('webrtc:signal', {
    detail: {
      type: 'Answer',
      from: state.myPeerId,
      to: msg.from,
      sdp: JSON.stringify(answer)
    }
  }));
}

export async function handleAnswer(msg) {
  const pc = state.peerConnections[msg.from];
  if (!pc) return;
  if (pc.signalingState !== 'have-local-offer') return;

  await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.sdp)));
}

export async function handleICE(msg) {
  const pc = state.peerConnections[msg.from];
  if (!pc) return;

  const candidate = JSON.parse(msg.candidate);

  if (!pc.remoteDescription) {
    if (!pc._iceQueue) pc._iceQueue = [];
    pc._iceQueue.push(candidate);
    return;
  }

  await pc.addIceCandidate(candidate);

  if (pc._iceQueue && pc._iceQueue.length) {
    for (const c of pc._iceQueue) {
      await pc.addIceCandidate(c);
    }
    pc._iceQueue = [];
  }
}

export function cleanupPeer(peerId) {
  if (state.peerConnections[peerId]) {
    try { state.peerConnections[peerId].close(); } catch (_) {}
    delete state.peerConnections[peerId];
  }

  if (state.dataChannels[peerId]) {
    delete state.dataChannels[peerId];
  }

  delete state.sendQueue[peerId];
  delete state.peers[peerId];

  const el = document.getElementById(`peer-${peerId}`);
  if (el) el.remove();
}

// Bridge outgoing signaling to websocket module without window globals.
// The websocket module listens and sends over its internal WS.
window.addEventListener('webrtc:signal', (e) => {
  window.dispatchEvent(new CustomEvent('ws:send', { detail: e.detail }));
});
window.addEventListener('webrtc:ice', (e) => {
  window.dispatchEvent(new CustomEvent('ws:send', { detail: { type: 'IceCandidate', ...e.detail } }));
});

