import { TransferManager } from './transfer.js';
import { state } from '../state.js';

const managersByPeerId = new Map();

export function getManagerForPeer(peerId) {
  const dc = state.dataChannels[peerId];
  if (!dc) return null;

  if (!managersByPeerId.has(peerId)) {
    managersByPeerId.set(peerId, new TransferManager(dc));
  }

  return managersByPeerId.get(peerId);
}

export function initTransferManager() {
  // Creates managers for any currently-open data channels.
  // Returns whether at least one manager/channel is available.
  const channels = Object.entries(state.dataChannels || {});
  let createdOrReady = false;

  for (const [peerId, dc] of channels) {
    if (!dc) continue;
    getManagerForPeer(peerId);
    if (dc.readyState === 'open') createdOrReady = true;
  }

  return createdOrReady;
}

export async function sendFileToAll(file) {
  const openPeers = Object.entries(state.dataChannels || {})
    .filter(([_, dc]) => dc && dc.readyState === 'open');

  if (!openPeers.length) {
    throw new Error('No open data channels');
  }

  await Promise.all(
    openPeers.map(([peerId]) => {
      const m = getManagerForPeer(peerId);
      if (!m) return Promise.resolve();
      return m.send(file);
    })
  );
}

