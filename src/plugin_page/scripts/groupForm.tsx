import { cogIcon, groupForm, groupTitle, groupWarning, sortUrlsSwitch, urlList, useContainerSwitch } from './dom';

import { updatePopupUrls } from './pluginPage';

import { getAdditionalLinks, saveAdditionalLinks, debugLog } from '../../common/reference';
import { updateGroupListInUrlsSetting } from './urlFom';
import { activateTab } from './tabs';
import { confirmAction, setStatus } from './ui';

/** Largest existing numeric id, or -1 for an empty collection. */
function maxId(records: { id: string }[]): number {
  return records.reduce((highest, item) => {
    const value = parseInt(`${item.id}`, 10);
    return isNaN(value) ? highest : Math.max(highest, value);
  }, -1);
}

export function initializeGroupForm() {
  document.addEventListener('DOMContentLoaded', function () {
    urlList.addEventListener('click', function (e) {
      const target = (e.target as HTMLElement).closest('.group-title') as HTMLButtonElement;
      if (!target) return;
      // This handler used to run in run mode too, silently rewriting hidden
      // form state when someone just wanted to open a link.
      if (cogIcon.dataset.action !== 'editMode') return;

      sortUrlsSwitch.checked = target.dataset.sortUrlsSwitch === 'true';
      useContainerSwitch.checked = target.dataset.useContainerSwitch === 'true';
      // `innerText` would now include the count badge.
      groupTitle.value = target.dataset.title || '';
      groupTitle.dataset.recordId = target.dataset.recordId || '';

      activateTab('GroupForm');
      setStatus(groupWarning, `Editing group "${groupTitle.value}".`, 'info', 0);
    });

    groupForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const submitter = event.submitter as HTMLButtonElement;
      const commitType = submitter ? submitter.dataset.commitType : 'save';
      const dataGroupTitle = groupTitle.value.trim();
      const dataRecordId = groupTitle.dataset.recordId;
      const dataSortUrlsSwitch = sortUrlsSwitch.checked ? 'true' : 'false';
      const dataUseContainerSwitch = useContainerSwitch.checked ? 'true' : 'false';

      if (commitType === 'delete') {
        if (!dataRecordId) {
          setStatus(groupWarning, 'Pick a group heading in the list above to delete it.', 'error');
          return;
        }
      } else if (dataGroupTitle === '') {
        // Used to return silently.
        groupTitle.setAttribute('aria-invalid', 'true');
        setStatus(groupWarning, 'Give the group a name.', 'error');
        groupTitle.focus();
        return;
      }
      groupTitle.setAttribute('aria-invalid', 'false');

      getAdditionalLinks()
        .then((accountDetails) => {
          if (!accountDetails['groups']) accountDetails['groups'] = [];
          const groups = accountDetails['groups'];
          const urls = accountDetails['urls'] || [];
          let message = '';

          if (commitType === 'save-as-new') {
            const clash = groups.filter((item) => `${item.title}`.toLowerCase() === dataGroupTitle.toLowerCase()).length;
            if (clash) {
              setStatus(groupWarning, `A group called "${dataGroupTitle}" already exists.`, 'error');
              return;
            }
            groups.push({
              id: `${maxId(groups) + 1}`,
              title: dataGroupTitle,
              sortUrlsSwitch: dataSortUrlsSwitch,
              useContainerSwitch: dataUseContainerSwitch,
            });
            message = `Added group "${dataGroupTitle}".`;
          } else if (commitType === 'save') {
            const index = groups.findIndex((item) => `${item.id}` === `${dataRecordId}`);
            if (index === -1) {
              setStatus(groupWarning, 'Nothing selected to update. Use Save as New, or pick a group above.', 'error');
              return;
            }
            groups[index] = {
              id: dataRecordId,
              title: dataGroupTitle,
              sortUrlsSwitch: dataSortUrlsSwitch,
              useContainerSwitch: dataUseContainerSwitch,
            };
            message = `Saved group "${dataGroupTitle}".`;
          } else if (commitType === 'delete') {
            const inUse = urls.filter((item) => `${item.groupId}` === `${dataRecordId}`).length;
            if (inUse) {
              setStatus(
                groupWarning,
                `Remove the ${inUse} link${inUse === 1 ? '' : 's'} in this group before deleting it.`,
                'error',
                0
              );
              return;
            }
            const removed = groups.filter((item) => `${item.id}` === `${dataRecordId}`)[0];
            const name = removed ? removed.title : dataGroupTitle;
            if (!confirmAction(submitter, groupWarning, `Delete group "${name}"? This cannot be undone.`)) {
              return;
            }
            accountDetails['groups'] = groups.filter((item) => `${item.id}` !== `${dataRecordId}`);
            message = `Deleted group "${name}".`;
            groupForm.reset();
            delete groupTitle.dataset.recordId;
          }

          return saveAdditionalLinks(accountDetails).then(() => {
            setStatus(groupWarning, message, 'success');
            updatePopupUrls();
            updateGroupListInUrlsSetting();
          });
        })
        .catch((error) => {
          debugLog('Error saving group:', error);
          setStatus(groupWarning, 'Could not save. Please try again.', 'error');
        });
    });
  });
}
