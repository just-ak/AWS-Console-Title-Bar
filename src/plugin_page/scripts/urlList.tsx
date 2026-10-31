import { getAdditionalLinks, saveAdditionalLinks, debugLog } from '../../common/reference';
import { collapseAllButton, urlList, urlListStatus, urlSearch, urlSearchClear } from './dom';
import { updatePopupUrls } from './pluginPage';
import { disarmAll } from './ui';

const COLLAPSED_KEY = 'actb.collapsedGroups';

/* -------------------------------------------------------------------------
   Collapse state — persisted so the popup reopens the way you left it.
   ---------------------------------------------------------------------- */

function readCollapsed(): string[] {
  try {
    const raw = window.localStorage.getItem(COLLAPSED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch (e) {
    return [];
  }
}

function writeCollapsed(ids: string[]): void {
  try {
    window.localStorage.setItem(COLLAPSED_KEY, JSON.stringify(ids));
  } catch (e) {
    debugLog('Could not persist collapsed groups');
  }
}

export function isGroupCollapsed(groupId: string): boolean {
  return readCollapsed().indexOf(`${groupId}`) !== -1;
}

function setGroupCollapsed(groupId: string, collapsed: boolean): void {
  const ids = readCollapsed();
  const index = ids.indexOf(`${groupId}`);
  if (collapsed && index === -1) ids.push(`${groupId}`);
  if (!collapsed && index !== -1) ids.splice(index, 1);
  writeCollapsed(ids);
}

/* -------------------------------------------------------------------------
   Filtering
   ---------------------------------------------------------------------- */

function groupToggles(): HTMLButtonElement[] {
  const nodes = urlList.querySelectorAll('.group-title');
  const result: HTMLButtonElement[] = [];
  for (let i = 0; i < nodes.length; i++) result.push(nodes[i] as HTMLButtonElement);
  return result;
}

function expandGroup(toggle: HTMLButtonElement, expanded: boolean): void {
  toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  const panelId = toggle.getAttribute('aria-controls');
  const panel = panelId ? (document.getElementById(panelId) as HTMLElement) : null;
  if (panel) panel.hidden = !expanded;
}

/**
 * Hide rows that do not match the filter box. While a filter is active every
 * group is force-expanded so matches are never hidden behind a collapsed
 * heading; clearing the box restores the saved collapse state.
 */
export function applyFilter(): void {
  if (!urlList) return;

  const term = urlSearch ? urlSearch.value.trim().toLowerCase() : '';
  let totalMatches = 0;

  groupToggles().forEach((toggle) => {
    const groupLi = toggle.parentElement as HTMLLIElement;
    const panelId = toggle.getAttribute('aria-controls');
    const panel = panelId ? (document.getElementById(panelId) as HTMLElement) : null;
    const groupId = toggle.dataset.recordId || '';
    const groupName = (toggle.dataset.title || '').toLowerCase();
    const groupMatches = term !== '' && groupName.indexOf(term) !== -1;

    let matches = 0;
    if (panel) {
      const items = panel.querySelectorAll('.url-item');
      for (let i = 0; i < items.length; i++) {
        const item = items[i] as HTMLLIElement;
        const link = item.querySelector('.url-link') as HTMLButtonElement;
        const haystack = `${link.dataset.title || ''} ${link.dataset.url || ''}`.toLowerCase();
        const hit = term === '' || groupMatches || haystack.indexOf(term) !== -1;
        item.hidden = !hit;
        if (hit) matches += 1;
      }
    }

    if (groupLi) groupLi.hidden = term !== '' && matches === 0;
    expandGroup(toggle, term !== '' ? true : !isGroupCollapsed(groupId));

    // While filtering the badge counts matches, not the whole group.
    const badge = toggle.querySelector('.url-group__count') as HTMLElement;
    if (badge) {
      const shown = term === '' ? parseInt(badge.dataset.total || '0', 10) : matches;
      badge.textContent = `${shown}`;
      badge.setAttribute('aria-label', `${shown} link${shown === 1 ? '' : 's'}`);
    }

    totalMatches += matches;
  });

  if (urlSearchClear) urlSearchClear.hidden = term === '';

  if (urlListStatus) {
    if (term === '') {
      urlListStatus.textContent = '';
    } else if (totalMatches === 0) {
      urlListStatus.textContent = `No links match "${term}".`;
    } else if (totalMatches === 1) {
      urlListStatus.textContent = `1 link matches "${term}".`;
    } else {
      urlListStatus.textContent = `${totalMatches} links match "${term}".`;
    }
  }

  syncCollapseAllButton();
}

function syncCollapseAllButton(): void {
  if (!collapseAllButton) return;
  const toggles = groupToggles();
  const anyExpanded = toggles.some((t) => t.getAttribute('aria-expanded') === 'true');
  collapseAllButton.dataset.action = anyExpanded ? 'collapse' : 'expand';
  const label = anyExpanded ? 'Collapse all groups' : 'Expand all groups';
  collapseAllButton.setAttribute('aria-label', label);
  collapseAllButton.title = label;
  collapseAllButton.disabled = toggles.length === 0;
}

/* -------------------------------------------------------------------------
   Keyboard support
   The list used to be <div>/<span> with no tabindex — completely
   unreachable without a mouse.
   ---------------------------------------------------------------------- */

function focusableRows(): HTMLElement[] {
  const nodes = urlList.querySelectorAll('.group-title, .url-link');
  const result: HTMLElement[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i] as HTMLElement;
    if (el.offsetParent !== null) result.push(el);
  }
  return result;
}

function moveFocus(current: HTMLElement, delta: number): void {
  const rows = focusableRows();
  const index = rows.indexOf(current);
  if (index === -1) return;
  const next = rows[index + delta];
  if (next) next.focus();
}

let pendingFocusRecordId: string | null = null;

/** Keyboard alternative to drag-and-drop reordering. */
function reorderUrl(link: HTMLButtonElement, delta: number): void {
  const recordId = link.dataset.recordId;
  const groupId = link.dataset.groupId;
  if (!recordId) return;

  getAdditionalLinks()
    .then((accountDetails) => {
      const urls = accountDetails['urls'] || [];
      const siblings = urls.filter((item) => `${item.groupId}` === `${groupId}`);
      const posInGroup = siblings.findIndex((item) => `${item.id}` === `${recordId}`);
      const target = siblings[posInGroup + delta];
      if (posInGroup === -1 || !target) {
        if (urlListStatus) {
          urlListStatus.textContent = delta < 0 ? 'Already first in its group.' : 'Already last in its group.';
        }
        return;
      }

      const from = urls.findIndex((item) => `${item.id}` === `${recordId}`);
      const to = urls.findIndex((item) => `${item.id}` === `${target.id}`);
      const moved = urls.splice(from, 1)[0];
      urls.splice(to, 0, moved);
      accountDetails['urls'] = urls;

      pendingFocusRecordId = recordId;
      return saveAdditionalLinks(accountDetails).then(() => {
        if (urlListStatus) {
          urlListStatus.textContent = `Moved ${moved.title} ${delta < 0 ? 'up' : 'down'}.`;
        }
        updatePopupUrls();
      });
    })
    .catch((error) => debugLog('Error reordering link:', error));
}

/** Restore focus after a re-render triggered by a keyboard reorder. */
export function restoreFocusAfterRender(): void {
  if (!pendingFocusRecordId) return;
  const selector = `.url-link[data-record-id="${pendingFocusRecordId}"]`;
  const target = urlList.querySelector(selector) as HTMLElement;
  pendingFocusRecordId = null;
  if (target) target.focus();
}

/* -------------------------------------------------------------------------
   Wiring
   ---------------------------------------------------------------------- */

export function initializeUrlList() {
  document.addEventListener('DOMContentLoaded', function () {
    updatePopupUrls();

    // Collapse / expand. groupForm.tsx separately uses this click to load the
    // group into the Groups form when edit mode is on.
    urlList.addEventListener('click', function (e) {
      const toggle = (e.target as HTMLElement).closest('.group-title') as HTMLButtonElement;
      if (!toggle) return;
      // While filtering, groups are force-expanded; collapsing would hide
      // the matches the user is looking at.
      if (urlSearch && urlSearch.value.trim() !== '') return;

      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      expandGroup(toggle, !expanded);
      setGroupCollapsed(toggle.dataset.recordId || '', expanded);
      syncCollapseAllButton();
    });

    urlList.addEventListener('keydown', function (e) {
      const row = (e.target as HTMLElement).closest('.group-title, .url-link') as HTMLElement;
      if (!row) return;

      if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        if (!row.classList.contains('url-link')) return;
        e.preventDefault();
        reorderUrl(row as HTMLButtonElement, e.key === 'ArrowUp' ? -1 : 1);
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveFocus(row, 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveFocus(row, -1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        const rows = focusableRows();
        if (rows.length) rows[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        const rows = focusableRows();
        if (rows.length) rows[rows.length - 1].focus();
      }
    });

    if (urlSearch) {
      urlSearch.addEventListener('input', function () {
        disarmAll();
        applyFilter();
      });
      urlSearch.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && urlSearch.value !== '') {
          e.preventDefault();
          urlSearch.value = '';
          applyFilter();
        } else if (e.key === 'ArrowDown') {
          const rows = focusableRows();
          if (rows.length) {
            e.preventDefault();
            rows[0].focus();
          }
        }
      });
    }

    if (urlSearchClear) {
      urlSearchClear.addEventListener('click', function () {
        urlSearch.value = '';
        applyFilter();
        urlSearch.focus();
      });
    }

    if (collapseAllButton) {
      collapseAllButton.addEventListener('click', function () {
        const collapseThem = collapseAllButton.dataset.action !== 'expand';
        groupToggles().forEach((toggle) => {
          expandGroup(toggle, !collapseThem);
          setGroupCollapsed(toggle.dataset.recordId || '', collapseThem);
        });
        syncCollapseAllButton();
      });
    }
  });
}
