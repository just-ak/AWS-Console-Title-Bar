import { disarmAll } from './ui';

/**
 * ARIA tabs: roles and relationships live in index.ejs, the roving tabindex,
 * arrow-key handling and selection state live here.
 *
 * Previously the tab strip was five unlabelled buttons toggled with inline
 * `display`, with `outline: none` and no keyboard support beyond Tab.
 */

const ACTIVE_TAB_KEY = 'actb.activeTab';

let activate: (tabName: string) => void = () => undefined;

/**
 * Bring a panel to the front. Used when a click in the link list targets a
 * form that is not the visible tab — otherwise the fields would be populated
 * somewhere the user cannot see.
 */
export function activateTab(tabName: string): void {
  activate(tabName);
}

export function initializeTabs() {
  const tabStrip = document.getElementById('tab');
  if (!tabStrip) return;

  const tabs = Array.prototype.slice.call(tabStrip.querySelectorAll('.tablinks')) as HTMLButtonElement[];
  if (!tabs.length) return;

  function panelFor(tab: HTMLButtonElement): HTMLElement | null {
    const id = tab.dataset.tabName;
    return id ? document.getElementById(id) : null;
  }

  function select(tab: HTMLButtonElement, moveFocus: boolean): void {
    disarmAll();

    tabs.forEach((candidate) => {
      const isSelected = candidate === tab;
      candidate.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      candidate.tabIndex = isSelected ? 0 : -1;
      candidate.classList.toggle('active', isSelected);

      const panel = panelFor(candidate);
      if (panel) panel.hidden = !isSelected;
    });

    try {
      window.localStorage.setItem(ACTIVE_TAB_KEY, tab.dataset.tabName || '');
    } catch (e) {
      /* storage is optional */
    }

    if (moveFocus) tab.focus();
  }

  tabStrip.addEventListener('click', function (e) {
    const tab = (e.target as HTMLElement).closest('.tablinks') as HTMLButtonElement;
    if (!tab) return;
    select(tab, false);
  });

  tabStrip.addEventListener('keydown', function (e) {
    const tab = (e.target as HTMLElement).closest('.tablinks') as HTMLButtonElement;
    if (!tab) return;

    const index = tabs.indexOf(tab);
    let next = -1;

    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;

    e.preventDefault();
    select(tabs[next], true);
  });

  activate = (tabName: string) => {
    const match = tabs.filter((tab) => tab.dataset.tabName === tabName)[0];
    if (match) select(match, false);
  };

  let initial = tabs[0];
  try {
    const remembered = window.localStorage.getItem(ACTIVE_TAB_KEY);
    if (remembered) {
      const match = tabs.filter((tab) => tab.dataset.tabName === remembered)[0];
      if (match) initial = match;
    }
  } catch (e) {
    /* storage is optional */
  }

  select(initial, false);
}
