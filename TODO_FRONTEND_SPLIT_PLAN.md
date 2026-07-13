# Frontend split execution plan

- Move from `frontend/js/app.js`:
  - cleanupPeer, renderPeers -> `frontend/js/ui/render.js`
  - createPeer, setupChannel, connectToPeer, handleOffer/Answer/ICE -> `frontend/js/network/webrtc.js`
  - createSession, fetchDiscovery, startScanner, ping -> `frontend/js/network/discovery.js`
  - connectWs, ws message dispatch -> `frontend/js/network/websocket.js`
  - sendFile, broadcastBinary, handleBinaryData, waitForBuffer -> `frontend/js/transfer/transfer.js`
- Replace `frontend/js/app.js` with bootstrap that sets globals + exports for HTML onclick handlers.
- Update `frontend/index.html` to load scripts in dependency order:
  1) config.js
  2) logger.js
  3) ui/render.js
  4) transfer/transfer.js
  5) network/webrtc.js
  6) network/websocket.js
  7) network/discovery.js
  8) app.js (bootstrap)
- Ensure all functions used by buttons are attached to `window`: createSession, startScanner, fetchDiscovery, connectWs, ping, sendFile.
