# Plan: Fix createSession export error

## Information Gathered
- `frontend/js/app.js` imports `{ createSession, fetchDiscovery, startScanner }` from `./ui/render.js`.
- `frontend/js/ui/render.js` currently exports: `renderPeers`, `renderDiscovered`, `startScanner`.
- `frontend/js/network/discovery.js` exports `createSession` and `fetchDiscovery`.
- `frontend/js/ui/render.js` imports `createSession` from `../network/discovery.js`, and uses it inside `renderDiscovered` card click handler.

## Plan
1. Fix the incorrect import in `frontend/js/app.js`:
   - Change import source of `createSession` and `fetchDiscovery` from `./ui/render.js` to `./network/discovery.js`.
   - Keep `startScanner` imported from `./ui/render.js`.
2. Verify no other module import paths expect `createSession` from `ui/render.js`.

## Dependent Files to be edited
- `frontend/js/app.js`

## Followup steps
- Run a quick sanity check by starting frontend (or just reload in browser) to confirm module import error is gone.

<ask_followup_question>
Proceed with editing `frontend/js/app.js` to adjust imports to:
- `import { createSession, fetchDiscovery } from './network/discovery.js'`
- `import { startScanner } from './ui/render.js'`
?</ask_followup_question>

