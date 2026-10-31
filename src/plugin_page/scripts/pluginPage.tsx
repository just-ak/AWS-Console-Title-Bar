import '../css/base.css';
import '../css/footer.css';
import '../css/form.css';
import '../css/groups.css';
import '../css/header.css';
import '../css/urlForm.css';
import '../css/urlList.css';
import '../css/accountConfig.css';
import '../css/tabs.css';
import '../css/preferences_form.css';

import { initializeTabs } from './tabs';
import { initializeHeader } from './header';
import { initializeBody } from './body';
import { initializeurlForm } from './urlFom';
import { initializeGroupForm } from './groupForm';
import { initializePreferencesForm } from './preferences';

import { getAdditionalLinks, debugLog, IAdditionalLinks, IGroupRecord, IUrlRecord } from '../../common/reference';

import { urlList, urlListStatus } from './dom';
import { upgradeManagement } from './upgrades';
import { initializePopupComs } from './popupcomms';
import { initializeUrlList, applyFilter, isGroupCollapsed, restoreFocusAfterRender } from './urlList';
import { initializeurlContainers } from './containers';

initializePopupComs();
initializeUrlList();
initializeHeader();
initializeBody();
initializeTabs();
initializeurlForm();
initializeGroupForm();
initializePreferencesForm();
initializeurlContainers();

/** Deterministic rail colour so each group is visually distinguishable. */
const RAIL_COUNT = 6;

function railFor(index: number): string {
  return `var(--c-rail-${(index % RAIL_COUNT) + 1})`;
}

function buildChevron(): HTMLSpanElement {
  const chevron = document.createElement('span');
  chevron.className = 'chevron';
  chevron.setAttribute('aria-hidden', 'true');
  return chevron;
}

function buildActionIcon(variant: 'open' | 'edit'): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', `url-link__action url-link__action--${variant}`);
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.6');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute(
    'd',
    variant === 'open'
      ? 'M6.5 3H3.8A.8.8 0 0 0 3 3.8v8.4a.8.8 0 0 0 .8.8h8.4a.8.8 0 0 0 .8-.8V9.5M9.5 2.5H13.5V6.5M13.5 2.5 7.5 8.5'
      : 'M11.2 2.8a1.2 1.2 0 0 1 1.7 1.7L6.2 11.2 3 12l.8-3.2 7.4-6z'
  );
  svg.appendChild(path);
  return svg;
}

function buildEmptyState(): HTMLLIElement {
  const li = document.createElement('li');
  const message = document.createElement('p');
  message.className = 'url-list__empty';

  const heading = document.createElement('strong');
  heading.textContent = 'No links yet';
  message.appendChild(heading);
  message.appendChild(document.createTextNode('Open the menu in the top left, then use the URL tab to add your first link.'));

  li.appendChild(message);
  return li;
}

function buildGroup(group: IGroupRecord, index: number, urls: IUrlRecord[]): HTMLLIElement {
  const groupLi = document.createElement('li');
  groupLi.className = 'url-group';
  groupLi.dataset.groupId = `${group.id}`;
  groupLi.style.setProperty('--group-rail', railFor(index));
  if (group.useContainerSwitch === 'true') {
    groupLi.classList.add('url-group--container');
  }

  const itemsId = `url-group-items-${group.id}`;
  const collapsed = isGroupCollapsed(`${group.id}`);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'group-title';
  toggle.dataset.recordId = `${group.id}`;
  // Carry the title as data rather than reading it back out of innerText —
  // the row now also renders a count badge.
  toggle.dataset.title = group.title;
  toggle.dataset.sortUrlsSwitch = group.sortUrlsSwitch;
  toggle.dataset.useContainerSwitch = group.useContainerSwitch;
  toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  toggle.setAttribute('aria-controls', itemsId);

  toggle.appendChild(buildChevron());

  const name = document.createElement('span');
  name.className = 'url-group__name';
  name.textContent = group.title;
  toggle.appendChild(name);

  const count = document.createElement('span');
  count.className = 'url-group__count';
  count.dataset.total = `${urls.length}`;
  count.textContent = `${urls.length}`;
  count.setAttribute('aria-label', `${urls.length} link${urls.length === 1 ? '' : 's'}`);
  toggle.appendChild(count);

  groupLi.appendChild(toggle);

  const itemsUl = document.createElement('ul');
  itemsUl.className = 'url-group__items';
  itemsUl.id = itemsId;
  itemsUl.hidden = collapsed;

  urls.forEach((urlItem) => {
    const li = document.createElement('li');
    li.className = 'url-item';

    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'url-link';
    link.dataset.url = urlItem.url;
    link.dataset.recordId = urlItem.id;
    link.dataset.groupId = `${group.id}`;
    link.dataset.title = urlItem.title;
    // Was `group.sortUrlsSwitch` — a copy/paste bug.
    link.dataset.useContainerSwitch = group.useContainerSwitch;
    link.dataset.containerTitle = group.title;
    link.draggable = true;
    link.title = `${urlItem.title}\n${urlItem.url}`;

    const label = document.createElement('span');
    label.className = 'url-link__title';
    label.textContent = urlItem.title;
    link.appendChild(label);

    link.appendChild(buildActionIcon('open'));
    link.appendChild(buildActionIcon('edit'));

    li.appendChild(link);
    itemsUl.appendChild(li);
  });

  groupLi.appendChild(itemsUl);
  return groupLi;
}

let isUpdating = false;
let updateQueued = false;

export const updatePopupUrls = () => {
  if (isUpdating) {
    // The old guard dropped the update instead of running it afterwards.
    updateQueued = true;
    return;
  }
  isUpdating = true;

  getAdditionalLinks()
    .then((additionalLinks) => {
      const accountDetails: IAdditionalLinks = upgradeManagement(additionalLinks);
      render(accountDetails);
    })
    .catch((error) => {
      debugLog('Error updating popup URLs:', error);
      if (urlListStatus) {
        urlListStatus.textContent = 'Could not load your saved links.';
      }
    })
    .then(() => {
      isUpdating = false;
      if (updateQueued) {
        updateQueued = false;
        updatePopupUrls();
      }
    });
};

function render(accountDetails: IAdditionalLinks): void {
  const groups: IGroupRecord[] = accountDetails.groups || [];
  const allUrls = accountDetails.urls || [];

  // Alphabetise groups. The previous `length > 2` condition meant one or two
  // groups were left in storage order for no stated reason.
  const sortedGroups = groups.slice().sort((a, b) => a.title.localeCompare(b.title, 'en'));

  // Build off-document, then swap once. The MutationObserver in body.tsx
  // fired for every appended node under the old node-by-node approach.
  const fragment = document.createDocumentFragment();

  if (!allUrls.length && !sortedGroups.length) {
    fragment.appendChild(buildEmptyState());
  } else {
    let railIndex = 0;
    sortedGroups.forEach((group) => {
      if (!group.title) return;

      let urls = allUrls.filter((urlItem) => `${urlItem.groupId}` === `${group.id}`);
      if (group.sortUrlsSwitch === 'true') {
        urls = urls.sort((a, b) => a.title.localeCompare(b.title, 'en'));
      }

      fragment.appendChild(buildGroup(group, railIndex, urls));
      railIndex += 1;
    });

    if (!allUrls.length) {
      fragment.appendChild(buildEmptyState());
    }
  }

  urlList.textContent = '';
  urlList.appendChild(fragment);

  // Re-apply whatever is in the filter box so a refresh does not reveal
  // rows the user has filtered out.
  applyFilter();
  restoreFocusAfterRender();
}
