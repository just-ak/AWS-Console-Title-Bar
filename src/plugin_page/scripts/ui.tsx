/**
 * Shared UI helpers: inline status messaging and two-step confirmation for
 * destructive actions.
 *
 * Before this existed, failed form submits returned silently (the form just
 * appeared to do nothing) and every Delete acted immediately with no undo.
 */

export type StatusTone = 'info' | 'success' | 'warning' | 'error';

/**
 * Write a message into a `role="status"` region so it is both visible and
 * announced. Pass `autoClearMs = 0` to leave the message in place.
 */
export function setStatus(target: HTMLElement | null, message: string, tone: StatusTone = 'info', autoClearMs = 4000): void {
  if (!target) return;

  const pending = parseInt(target.dataset.statusTimer || '', 10);
  if (!isNaN(pending)) {
    window.clearTimeout(pending);
    delete target.dataset.statusTimer;
  }

  target.textContent = message;
  if (message) {
    target.dataset.tone = tone;
  } else {
    delete target.dataset.tone;
  }

  if (message && autoClearMs > 0) {
    const timer = window.setTimeout(() => {
      target.textContent = '';
      delete target.dataset.tone;
      delete target.dataset.statusTimer;
    }, autoClearMs);
    target.dataset.statusTimer = `${timer}`;
  }
}

const ARM_TIMEOUT_MS = 5000;

function disarm(button: HTMLElement): void {
  const original = button.dataset.originalLabel;
  if (original !== undefined) {
    button.textContent = original;
    delete button.dataset.originalLabel;
  }
  delete button.dataset.confirmArmed;
  button.classList.remove('is-armed');

  const timer = parseInt(button.dataset.armTimer || '', 10);
  if (!isNaN(timer)) {
    window.clearTimeout(timer);
    delete button.dataset.armTimer;
  }
}

/** Cancel the armed state on every destructive button on the page. */
export function disarmAll(): void {
  const armed = document.querySelectorAll('[data-confirm-armed="true"]');
  for (let i = 0; i < armed.length; i++) {
    disarm(armed[i] as HTMLElement);
  }
}

/**
 * Two-step confirmation. The first activation relabels the button and
 * returns `false`; a second activation within 5s returns `true`.
 *
 * A modal `confirm()` is avoided deliberately: in a browser-action popup a
 * native dialog can dismiss the popup itself and take the pending action
 * with it.
 */
export function confirmAction(
  button: HTMLElement | null,
  statusTarget?: HTMLElement | null,
  promptMessage = 'Press again to confirm. This cannot be undone.'
): boolean {
  if (!button) return true;

  if (button.dataset.confirmArmed === 'true') {
    disarm(button);
    setStatus(statusTarget || null, '', 'info', 0);
    return true;
  }

  disarmAll();

  button.dataset.originalLabel = button.textContent || '';
  button.dataset.confirmArmed = 'true';
  button.classList.add('is-armed');
  button.textContent = button.dataset.confirmLabel || 'Confirm';
  setStatus(statusTarget || null, promptMessage, 'warning', 0);

  const timer = window.setTimeout(() => {
    disarm(button);
    setStatus(statusTarget || null, '', 'info', 0);
  }, ARM_TIMEOUT_MS);
  button.dataset.armTimer = `${timer}`;

  return false;
}

/**
 * Accept the host-only addresses people actually type
 * ("console.aws.amazon.com") and turn them into something `tabs.create`
 * will open. Returns null when the value cannot be made into an http(s) URL.
 */
export function normalizeUrl(raw: string): string | null {
  const value = (raw || '').trim();
  if (!value) return null;

  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    if (parsed.hostname.indexOf('.') === -1 && parsed.hostname !== 'localhost') return null;
    return parsed.toString();
  } catch (e) {
    return null;
  }
}

/** Hostname only, for tooltips. Falls back to the raw value. */
export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    return url;
  }
}
