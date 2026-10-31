import { getAllAccounts, saveAllAccounts, debugLog } from '../../common/reference';
import { accountConfigDiv } from './dom';

export function initializePopupComs() {
  document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length || tabs[0].id === undefined) return;
      chrome.tabs.sendMessage(tabs[0].id, 'popupcomms', (response) => {
        if (response && response.accountId) {
          showSingleAccount(response.accountId);
        } else {
          // Not an AWS console tab. The panel keeps its empty state.
          debugLog('No accountId in popupcomms response');
        }
      });
    });

    const showSingleAccount = (accountId: string) => {
      const container = accountConfigDiv;
      if (!container) return;

      getAllAccounts().then((jsonData) => {
        const account = jsonData[accountId];
        if (!account) return;

        container.textContent = '';

        const inputId = `account-color-${accountId}`;
        const row = document.createElement('div');
        row.className = 'account-row';

        const labelWrap = document.createElement('span');
        labelWrap.className = 'account-row__label';

        // A real <label for> pairing. The colour field used to be unlabelled.
        const label = document.createElement('label');
        label.className = 'account-row__id';
        label.htmlFor = inputId;
        label.textContent = account.id;
        labelWrap.appendChild(label);

        const meta = document.createElement('span');
        meta.className = 'account-row__meta';
        meta.textContent = accountId;
        labelWrap.appendChild(meta);
        row.appendChild(labelWrap);

        const colorInput = document.createElement('input');
        colorInput.id = inputId;
        colorInput.type = 'text';
        colorInput.className = 'color-input';
        colorInput.dataset.coloris = '';
        // The account id is carried as data instead of being parsed back out
        // of the label's text content.
        colorInput.dataset.accountId = accountId;
        colorInput.value = account.color;
        colorInput.style.color = account.color;
        colorInput.style.backgroundColor = account.color;

        colorInput.addEventListener('change', function (event) {
          const input = event.target as HTMLInputElement;
          const selectedColor = input.value;
          const targetAccountId = input.dataset.accountId;

          getAllAccounts().then((data) => {
            if (!data[targetAccountId]) return;
            data[targetAccountId].color = selectedColor;
            input.style.color = selectedColor;
            input.style.backgroundColor = selectedColor;
            saveAllAccounts(data).finally(() => {
              chrome.tabs.query({ active: true, currentWindow: true }, (openTabs) => {
                if (!openTabs.length || openTabs[0].id === undefined) return;
                chrome.tabs.sendMessage(openTabs[0].id, `updateColour:${selectedColor}`, () => true);
              });
            });
          });
        });

        row.appendChild(colorInput);

        const form = document.createElement('form');
        form.appendChild(row);
        container.appendChild(form);
      });
    };
  });
}
