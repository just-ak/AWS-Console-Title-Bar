import { getAdditionalLinks, saveAdditionalLinks, debugLog, IAdditionalLinks } from '../../common/reference';
import { preferencesStatus } from './dom';
import { setStatus } from './ui';

export function initializePreferencesForm() {
  document.addEventListener('DOMContentLoaded', function () {
    const preferencesForm = document.getElementById('preferences-form') as HTMLFormElement;
    const awsConsoleCompress = document.getElementById('aws-console-compress') as HTMLInputElement;

    getAdditionalLinks().then((accountDetails: IAdditionalLinks) => {
      if (accountDetails.preferences && accountDetails.preferences.awsConsole) {
        awsConsoleCompress.checked = !!accountDetails.preferences.awsConsole.compressMode;
      }
    });

    preferencesForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const compressMode = awsConsoleCompress.checked;

      getAdditionalLinks()
        .then((accountDetails: IAdditionalLinks) => {
          if (!accountDetails.preferences) {
            accountDetails.preferences = {
              awsConsole: { compressMode: false },
            };
          }
          if (!accountDetails.preferences.awsConsole) {
            accountDetails.preferences.awsConsole = { compressMode: false };
          }
          accountDetails.preferences.awsConsole.compressMode = compressMode;

          return saveAdditionalLinks(accountDetails).then(() => {
            debugLog('Preferences saved:', JSON.stringify(accountDetails.preferences, null, 2));
            // Saving used to produce no visible feedback at all.
            setStatus(preferencesStatus, compressMode ? 'Saved. Compress mode is on.' : 'Saved. Compress mode is off.', 'success');
          });
        })
        .catch((error) => {
          debugLog('Error saving preferences:', error);
          setStatus(preferencesStatus, 'Could not save. Please try again.', 'error');
        });
    });
  });
}
