import { debugLog } from '../../common/reference';
import { body, firefoxViewport } from './dom';

// A browser-action popup is capped at 800px wide by 600px tall. The previous
// values had these two transposed.
const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;

let lastWidth = '';
let lastHeight = '';

export function resizeBody() {
  const width = `${Math.min(firefoxViewport.scrollWidth, MAX_WIDTH)}px`;
  const height = `${Math.min(firefoxViewport.scrollHeight, MAX_HEIGHT)}px`;

  // Skip identical writes so a burst of mutations costs one layout, not many.
  if (width === lastWidth && height === lastHeight) return;
  lastWidth = width;
  lastHeight = height;

  body.style.width = width;
  body.style.height = height;
  debugLog(`Resized popup to ${width} x ${height}`);
}

export function initializeBody() {
  // Synchronous on purpose: deferring to requestAnimationFrame left the
  // popup at its pre-render height whenever the frame callback was
  // throttled. The link list now swaps in a single DocumentFragment, so
  // this fires once per render rather than once per row.
  const observer = new MutationObserver(resizeBody);
  observer.observe(firefoxViewport, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  resizeBody();
}
