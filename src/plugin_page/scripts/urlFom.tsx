import { getAdditionalLinks, saveAdditionalLinks, onUpdated, onError, debugLog } from '../../common/reference';
import { urlList, cogIcon, urlForm, groupSelect, urlFormStatus } from './dom';
import { createContainer } from './firefox';
import { updatePopupUrls } from './pluginPage';
import { confirmAction, normalizeUrl, setStatus } from './ui';
import { activateTab } from './tabs';

const urlInput = () => document.getElementById('url-input') as HTMLInputElement;
const titleInput = () => document.getElementById('title-input') as HTMLInputElement;

function isRunMode(): boolean {
  return cogIcon.dataset.action === 'runMode' || cogIcon.dataset.action === undefined;
}

/** Largest existing numeric id, or -1 for an empty collection. */
function maxId(records: { id: string }[]): number {
  return records.reduce((highest, item) => {
    const value = parseInt(`${item.id}`, 10);
    return isNaN(value) ? highest : Math.max(highest, value);
  }, -1);
}

function openUrl(target: HTMLButtonElement): void {
  const chosenPage = normalizeUrl(target.dataset.url || '') || target.dataset.url;
  const groupId = target.dataset.groupId;

  getAdditionalLinks()
    .then((accountDetails) => {
      const groupDetails = (accountDetails['groups'] || []).filter((group) => `${group.id}` === `${groupId}`)[0];
      const useContainer = groupDetails && groupDetails.useContainerSwitch === 'true';

      if (!useContainer || typeof browser === 'undefined' || !browser.contextualIdentities) {
        chrome.tabs.create({ url: chosenPage }, onUpdated);
        return;
      }

      const containerName = groupDetails.title;
      browser.contextualIdentities
        .query({})
        .then((identities) => {
          const identity = identities.filter((i) => i.name === containerName)[0];
          if (identity && identity.cookieStoreId) {
            browser.tabs
              .create({
                url: chosenPage,
                cookieStoreId: identity.cookieStoreId,
              })
              .then(onUpdated, onError);
            return;
          }
          createContainer(containerName)
            .then((id) => {
              browser.tabs.create({ url: chosenPage, cookieStoreId: id }).then(onUpdated, onError);
            })
            .catch((error) => {
              debugLog('Error creating container:', error);
              browser.tabs.create({ url: chosenPage }).then(onUpdated, onError);
            });
        })
        .catch((error) => {
          debugLog('Error querying containers:', error);
          browser.tabs.create({ url: chosenPage }).then(onUpdated, onError);
        });
    })
    .catch((error) => debugLog('Failed to open link:', error));
}

function loadIntoForm(target: HTMLButtonElement): void {
  urlForm.dataset.action = 'edit';

  const url = urlInput();
  const title = titleInput();
  url.value = target.dataset.url || '';
  url.dataset.recordId = target.dataset.recordId || '';
  url.setAttribute('aria-invalid', 'false');
  // Was `target.innerText`, which now also contains the icon markup.
  title.value = target.dataset.title || '';
  title.setAttribute('aria-invalid', 'false');
  groupSelect.value = target.dataset.groupId || '';

  activateTab('URLForm');
  setStatus(urlFormStatus, `Editing "${title.value}".`, 'info', 0);
}

export function initializeurlForm() {
  document.addEventListener('DOMContentLoaded', function () {
    updateGroupListInUrlsSetting();

    urlList.addEventListener('click', function (e) {
      // `closest` rather than `e.target`: the row is a <button> with child
      // elements, so the click target is often the label or the icon.
      const target = (e.target as HTMLElement).closest('.url-link') as HTMLButtonElement;
      if (!target) return;

      if (isRunMode()) {
        openUrl(target);
      } else {
        loadIntoForm(target);
      }
    });

    urlForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const submitter = event.submitter as HTMLButtonElement;
      const commitType = submitter ? submitter.dataset.commitType : 'save';
      const url = urlInput();
      const title = titleInput();
      const recordId = url.dataset.recordId;

      if (commitType === 'delete') {
        if (!recordId) {
          setStatus(urlFormStatus, 'Pick a link in the list above to delete it.', 'error');
          return;
        }
        if (!confirmAction(submitter, urlFormStatus, `Delete "${title.value}"? This cannot be undone.`)) {
          return;
        }
      } else {
        const normalized = normalizeUrl(url.value);
        url.setAttribute('aria-invalid', normalized ? 'false' : 'true');
        if (!normalized) {
          // Used to return silently, so the form looked broken.
          setStatus(urlFormStatus, 'Enter a web address, for example console.aws.amazon.com.', 'error');
          url.focus();
          return;
        }
        url.value = normalized;

        const hasTitle = title.value.trim() !== '';
        title.setAttribute('aria-invalid', hasTitle ? 'false' : 'true');
        if (!hasTitle) {
          setStatus(urlFormStatus, 'Give the link a title so you can recognise it.', 'error');
          title.focus();
          return;
        }

        if (commitType === 'save' && !recordId) {
          setStatus(urlFormStatus, 'Nothing selected to update. Use Save as New, or pick a link above.', 'error');
          return;
        }
      }

      getAdditionalLinks()
        .then((accountDetails) => {
          if (!accountDetails['urls']) accountDetails['urls'] = [];
          const urls = accountDetails['urls'];
          const groupId = groupSelect.value;
          let message = '';

          if (commitType === 'save-as-new') {
            urls.push({
              id: `${maxId(urls) + 1}`,
              url: url.value,
              title: title.value.trim(),
              groupId: groupId,
            });
            message = `Added "${title.value.trim()}".`;
          } else if (commitType === 'save') {
            const index = urls.findIndex((item) => `${item.id}` === `${recordId}`);
            if (index === -1) {
              setStatus(urlFormStatus, 'That link no longer exists.', 'error');
              return;
            }
            urls[index] = {
              id: recordId,
              url: url.value,
              title: title.value.trim(),
              groupId: groupId,
            };
            message = `Saved "${title.value.trim()}".`;
          } else if (commitType === 'delete') {
            const removed = urls.filter((item) => `${item.id}` === `${recordId}`)[0];
            accountDetails['urls'] = urls.filter((item) => `${item.id}` !== `${recordId}`);
            message = `Deleted "${removed ? removed.title : 'link'}".`;
            urlForm.reset();
            delete url.dataset.recordId;
            urlForm.dataset.action = 'new';
          }

          // Removed here: a block that did
          //   accountDetails['groups'][newGroupInput.value] = { ... }
          // which wrote a string key onto the groups *array*. Group creation
          // belongs to the Groups tab.

          return saveAdditionalLinks(accountDetails).then(() => {
            setStatus(urlFormStatus, message, 'success');
            updatePopupUrls();
          });
        })
        .catch((error) => {
          debugLog('Error saving link:', error);
          setStatus(urlFormStatus, 'Could not save. Please try again.', 'error');
        });
    });

    /* --- Drag and drop reordering ------------------------------------- */

    let draggedId: string | null = null;

    function clearDropMarkers(): void {
      const marked = urlList.querySelectorAll('.is-drop-target, .is-drop-target-above');
      for (let i = 0; i < marked.length; i++) {
        marked[i].classList.remove('is-drop-target');
        marked[i].classList.remove('is-drop-target-above');
      }
    }

    urlList.addEventListener('dragstart', function (e) {
      const target = (e.target as HTMLElement).closest('.url-link') as HTMLButtonElement;
      if (!target) return;
      draggedId = target.dataset.recordId || null;
      e.dataTransfer.setData('text/plain', draggedId || '');
      e.dataTransfer.effectAllowed = 'move';
      target.classList.add('is-dragging');
    });

    urlList.addEventListener('dragend', function (e) {
      const target = (e.target as HTMLElement).closest('.url-link') as HTMLButtonElement;
      if (target) target.classList.remove('is-dragging');
      clearDropMarkers();
      draggedId = null;
    });

    urlList.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      // Visible drop indicator; previously there was none, so you could not
      // tell where an item would land.
      const row = (e.target as HTMLElement).closest('.url-item') as HTMLLIElement;
      clearDropMarkers();
      if (!row) return;
      const box = row.getBoundingClientRect();
      const above = e.clientY < box.top + box.height / 2;
      row.classList.add(above ? 'is-drop-target-above' : 'is-drop-target');
    });

    urlList.addEventListener('dragleave', clearDropMarkers);

    urlList.addEventListener('drop', function (e) {
      e.preventDefault();
      const droppedId = e.dataTransfer.getData('text/plain') || draggedId;
      const row = (e.target as HTMLElement).closest('.url-item') as HTMLLIElement;
      clearDropMarkers();
      if (!row || !droppedId) return;

      const targetLink = row.querySelector('.url-link') as HTMLButtonElement;
      const targetId = targetLink ? targetLink.dataset.recordId : null;
      if (!targetId || targetId === droppedId) return;

      getAdditionalLinks().then((accountDetails) => {
        const urls = accountDetails['urls'] || [];
        const from = urls.findIndex((item) => `${item.id}` === `${droppedId}`);
        const to = urls.findIndex((item) => `${item.id}` === `${targetId}`);
        if (from === -1 || to === -1) return;

        const [moved] = urls.splice(from, 1);
        // Dropping onto a row in another group moves the link into that
        // group, which is what the gesture implies.
        moved.groupId = targetLink.dataset.groupId;
        urls.splice(to, 0, moved);
        accountDetails['urls'] = urls;
        saveAdditionalLinks(accountDetails).then(() => updatePopupUrls());
      });
    });
  });
}

export function updateGroupListInUrlsSetting() {
  getAdditionalLinks().then((accountDetails) => {
    const previous = groupSelect.value;
    while (groupSelect.options.length > 0) {
      groupSelect.options.remove(0);
    }
    if (accountDetails['groups'] && Array.isArray(accountDetails['groups'])) {
      const groups = accountDetails['groups'].slice().sort((a, b) => `${a.title}`.localeCompare(`${b.title}`, 'en'));
      for (const group of groups) {
        const option = document.createElement('option');
        option.value = group.id;
        option.text = group.title;
        groupSelect.add(option);
      }
    }
    // Only restore the previous selection if it still exists, otherwise the
    // <select> ends up showing a blank row.
    const stillThere = previous && Array.prototype.some.call(groupSelect.options, (o: HTMLOptionElement) => o.value === previous);
    if (stillThere) {
      groupSelect.value = previous;
    } else if (groupSelect.options.length) {
      groupSelect.selectedIndex = 0;
    }
  });
}
