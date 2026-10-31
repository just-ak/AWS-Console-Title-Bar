export interface PopupComms {
  accountId: string;
}

export interface AccountDetails {
  id: string;
  color: string;
  background: string;
  headerBackground: string;
  headerColor: string;
}

export interface IGroupRecord {
  id: string;
  title: string;
  sortUrlsSwitch: string;
  useContainerSwitch: string;
}

export interface IUrlRecord {
  id: string;
  title: string;
  url: string;
  group?: string;
  groupId?: string;
}

export interface IAdditionalLinks {
  urls: IUrlRecord[];
  groups: IGroupRecord[];
  preferences: {
    awsConsole: {
      compressMode: boolean;
    };
  };
  version: string;
}

export function onUpdated(tab) {
  debugLog(`Updated tab: ${tab.id}`);
}

export function onError(error) {
  debugLog(`Error: ${error}`);
}

export const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

export function setDebug() {
  getAdditionalLinks().then((data) => {
    if (data['DEBUG'] && data['DEBUG'] === true) {
      data['DEBUG'] = false;
      debugLog('Debugging Disabled');
    } else {
      data['DEBUG'] = true;
      debugLog('Debugging Enabled');
    }
    saveAdditionalLinks(data);
  });
}

export function debugLog(message: string, ...optionalParams: any[]) {
  getAdditionalLinks().then((data) => {
    if (data['DEBUG'] && data['DEBUG'] === true) {
      console.log(message, ...optionalParams);
    }
  });
}

export const isElementLoaded = async (selector) => {
  while (document.querySelector(selector) === null) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return document.querySelector(selector);
};

export async function putPopupComms(data: PopupComms) {
  return await new Promise((resolve, reject) => {
    if (data.accountId) {
      return chrome.storage.local.set({
        popupcomms: JSON.stringify(data),
      });
    } else {
      reject('No Account Id');
    }
  });
}

export async function getPopupComms() {
  return await new Promise((resolve, reject) =>
    chrome.storage.local.get('popupcomms', (response) => {
      try {
        const popupCom: PopupComms = JSON.parse(response.popupcomms);
        resolve(popupCom);
      } catch (e) {
        reject(e);
      }
    })
  );
}

export async function getAdditionalLinks() {
  return await new Promise(function (resolve, reject) {
    chrome.storage.local.get('jsoninfo', function (response) {
      try {
        const accountDetails = JSON.parse(response.jsoninfo);
        resolve(accountDetails);
      } catch (e) {
        if (e.message.indexOf('unexpected end of data at line 1 column 1') !== -1) {
          debugLog(`Error Empty JSON: ${e} DataError: ${response.jsoninfo}`);
        } else {
          debugLog(`Error in getAdditionalLinks: ${e} \n ${JSON.stringify(response, null, 2)} `);
        }
        resolve(defaultJson);
      }
    });
  });
}

export async function saveAdditionalLinks(data) {
  return await new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set({
        jsoninfo: JSON.stringify(data),
      });
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

export async function saveAllAccounts(data) {
  return await new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set({
        jsonaccounts: JSON.stringify(data),
      });
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}
export async function getAccount(accountId) {
  return await new Promise((resolve, reject) =>
    chrome.storage.local.get('jsonaccounts', (response) => {
      try {
        const accountDetails: AccountDetails = JSON.parse(response.jsonaccounts);
        if (accountDetails && accountDetails[accountId] !== undefined) {
          resolve(accountDetails[accountId]);
        } else {
          reject(`Unknown Account Id: ${accountId}`);
        }
      } catch (e) {
        reject(e);
      }
    })
  );
}

export async function getAllAccounts() {
  return await new Promise((resolve, reject) =>
    chrome.storage.local.get('jsonaccounts', (response) => {
      if (response) {
        try {
          resolve(JSON.parse(response.jsonaccounts));
        } catch (e) {
          resolve({});
        }
      } else {
        resolve({});
      }
      reject();
    })
  );
}

export const defaultJson = {
  urls: [
    {
      title: 'Google',
      url: 'https://google.com',
      id: '0',
      groupId: 0,
    },
    {
      title: 'Microsoft',
      url: 'https://microsoft.com',
      id: '1',
      groupId: 0,
    },
  ],
  groups: [
    {
      id: 0,
      title: 'Default',
      sortUrlsSwitch: 'true',
      useContainerSwitch: 'false',
    },
  ],
  version: '5.5.5.1',
  preferences: {
    awsConsole: {
      compressMode: false,
    },
  },
};
