import '../css/preferences.css';

import { defaultJson, getAllAccounts, saveAllAccounts } from '../../common/reference';

const jsonElementID = 'jsoninfo';
const jsonAccElementID = 'jsonaccounts';

interface AccountDetails {
  id: string;
  color: string;
  background: string;
  headerBackground: string;
  headerColor: string;
}

function save_options() {
  const jsonTextArea = document.getElementById(jsonElementID) as HTMLTextAreaElement;
  const jsoninfo = jsonTextArea.value;
  chrome.storage.local.set(
    {
      jsoninfo: jsoninfo,
    },
    function () {
      const status = document.getElementById('status');
      status.textContent = 'Options Extras saved.';
      setTimeout(function () {
        status.textContent = '';
      }, 750);
    }
  );
}

function restore_options() {
  chrome.storage.local.get(
    {
      jsoninfo: JSON.stringify(defaultJson),
    },
    function (options) {
      const jsonTextArea = document.getElementById(jsonElementID) as HTMLTextAreaElement;
      try {
        jsonTextArea.value = JSON.stringify(JSON.parse(options.jsoninfo), null, 2);
      } catch (e) {
        if (e.message.indexOf('Unexpected end of JSON input') !== -1) {
          console.log(`Error parsing JSON: ${e} DataError: ${options.jsoninfo}`);
        }
        jsonTextArea.value = JSON.stringify(defaultJson, null, 2);
      }
      jsonTextArea.style.height = `${jsonTextArea.scrollHeight}px`;
    }
  );

  getAllAccounts().then((data) => {
    showAccounts(data);
  });
}

const showAccounts = (jsonData) => {
  const container = document.getElementById('accountConfig');
  const form = document.createElement('form');
  for (const accountId in jsonData) {
    if (jsonData[accountId] !== undefined) {
      const account = jsonData[accountId];
      const accountDiv = document.createElement('div');
      const nameLabel = document.createElement('label');
      nameLabel.textContent = account.id + ': ' + accountId;

      accountDiv.appendChild(nameLabel);
      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.value = account.color;
      colorInput.addEventListener('change', function (event) {
        const selectedColor = (event.target as HTMLInputElement).value;
        const accountId = (event.target as HTMLInputElement).parentNode.querySelector('label').textContent.split(':')[1].trim();
        const curList = getAllAccounts().then((data) => {
          data[accountId].color = selectedColor;
          saveAllAccounts(data);
        });
      });

      accountDiv.appendChild(colorInput);
      form.appendChild(accountDiv);
    }
  }
  container.appendChild(form);
};

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
