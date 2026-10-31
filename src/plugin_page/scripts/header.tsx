import { body, cogIcon, editMode, githubButton, helpButton, modeBadge, urlForm } from './dom';

import { debugLog, onError, onUpdated } from '../../common/reference';
import { resizeBody } from './body';
import { disarmAll } from './ui';

const HELP_URL = 'https://aws-console-title-bar.akfdev.com/';
const GITHUB_URL = 'https://github.com/just-ak/AWS-Console-Title-Bar';

function openInNewTab(url: string): void {
  if (typeof browser !== 'undefined') {
    browser.tabs.create({ url }).then(onUpdated, onError);
  } else if (typeof chrome !== 'undefined') {
    chrome.tabs.create({ url }, onUpdated);
  } else {
    console.error('Browser API not supported');
  }
}

export function initializeHeader() {
  /**
   * Run mode: clicking a link opens it.
   * Edit mode: clicking a link loads it into the URL form instead.
   *
   * That difference used to be invisible. `data-mode` on <body> now drives a
   * header badge and the per-row icon, and `aria-expanded` reports the state
   * of the settings panel.
   */
  function setMode(mode: 'run' | 'edit'): void {
    const editing = mode === 'edit';

    cogIcon.dataset.action = editing ? 'editMode' : 'runMode';
    cogIcon.setAttribute('aria-expanded', editing ? 'true' : 'false');

    const label = document.getElementById('awsso-header-label');
    if (label) label.textContent = editing ? 'Hide settings' : 'Show settings';
    cogIcon.title = editing ? 'Hide settings' : 'Show settings';

    editMode.hidden = !editing;
    body.dataset.mode = mode;
    if (modeBadge) modeBadge.hidden = !editing;

    if (editing) {
      urlForm.dataset.action = 'new';
    } else {
      disarmAll();
    }

    debugLog(editing ? 'Edit Mode' : 'Run Mode');
    resizeBody();
  }

  setMode('run');

  cogIcon.addEventListener('click', function () {
    setMode(cogIcon.dataset.action === 'editMode' ? 'run' : 'edit');
  });

  // Escape closes the settings panel, which is what people expect from a
  // disclosure in a popup.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (cogIcon.dataset.action !== 'editMode') return;
    const active = document.activeElement as HTMLElement;
    if (active && active.tagName === 'INPUT' && (active as HTMLInputElement).value !== '') return;
    setMode('run');
    cogIcon.focus();
  });

  githubButton.addEventListener('click', () => openInNewTab(GITHUB_URL));
  helpButton.addEventListener('click', () => openInNewTab(HELP_URL));
}
