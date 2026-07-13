// Centralized frontend state for ES-module integration.
// No window globals.

export const state = {
  sessionId: null,
  myPeerId: null,

  peers: {},

  // WebRTC peer connections by remote peerId
  peerConnections: {},

  // WebRTC data channels by remote peerId
  dataChannels: {},

  // Queues for messages to send once a data channel opens
  sendQueue: {},

  // Legacy incoming transfer (used only by transfer_old.js if enabled)
  incomingFiles: {},
};

