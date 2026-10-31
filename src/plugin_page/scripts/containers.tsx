import { debugLog, getAdditionalLinks, setDebug } from '../../common/reference';
import { clearContainersButton, clearContainersHidden, containersStatus } from './dom';
import { confirmAction, setStatus } from './ui';

export function initializeurlContainers() {
  document.addEventListener('DOMContentLoaded', function () {
    // Reflect the current debug flag so the toggle is not write-only.
    getAdditionalLinks()
      .then((data) => {
        clearContainersHidden.setAttribute('aria-pressed', data && data['DEBUG'] ? 'true' : 'false');
      })
      .catch(() => undefined);

    clearContainersButton.addEventListener('click', function () {
      if (typeof browser === 'undefined' || !browser.contextualIdentities) {
        setStatus(containersStatus, 'Containers are a Firefox feature and are not available here.', 'warning');
        return;
      }

      // This removes every contextual identity in the browser, including
      // ones this extension never created, and destroys their cookie
      // stores. It now requires a second, explicit confirmation.
      if (
        !confirmAction(
          clearContainersButton,
          containersStatus,
          'This deletes every Firefox container and signs you out of each one. Press again to confirm.'
        )
      ) {
        return;
      }

      browser.contextualIdentities
        .query({})
        .then((identities) => {
          if (!identities.length) {
            setStatus(containersStatus, 'There were no containers to remove.', 'info');
            return;
          }
          const removals = identities.map((identity) => browser.contextualIdentities.remove(identity.cookieStoreId));
          return Promise.all(removals).then(() => {
            setStatus(containersStatus, `Removed ${identities.length} container${identities.length === 1 ? '' : 's'}.`, 'success');
          });
        })
        .catch((error) => {
          debugLog('Error querying containers:', error);
          setStatus(containersStatus, 'Could not remove the containers.', 'error');
        });
    });

    clearContainersHidden.addEventListener('click', function () {
      const next = clearContainersHidden.getAttribute('aria-pressed') !== 'true';
      clearContainersHidden.setAttribute('aria-pressed', next ? 'true' : 'false');
      setDebug();
      setStatus(containersStatus, next ? 'Debug logging enabled.' : 'Debug logging disabled.', 'info');
    });
  });
}
