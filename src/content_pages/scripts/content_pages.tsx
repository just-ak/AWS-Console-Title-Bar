import {
  debugLog,
  getAccount,
  getAdditionalLinks,
  getAllAccounts,
  IAdditionalLinks,
  isElementLoaded,
  saveAllAccounts,
} from '../../common/reference';

export interface AccountDetails {
  id: string;
  color: string;
  background: string;
  headerBackground: string;
  headerColor: string;
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message == 'popupcomms') {
    const accountNumber = getAWSUserInfoAccountNumber();
    if (accountNumber) {
      sendResponse({ title: document.title, accountId: accountNumber });
    }
  }
  if ((message as string).startsWith('updateColour')) {
    let elementAccountName: HTMLElement;
    if (document.getElementById('awsconsolelables_name')) {
      elementAccountName = document.getElementById('awsconsolelables_name');
      elementAccountName.style.setProperty('color', (message as string).split(':')[1], 'important');
    }
  }
  //return { title: document.title , accountId: accountId};
});

//   /$$$$$$  /$$      /$$  /$$$$$$        /$$   /$$                                             /$$       /$$$$$$$
//  /$$__  $$| $$  /$ | $$ /$$__  $$      | $$$ | $$                                            | $$      | $$__  $$
// | $$  \ $$| $$ /$$$| $$| $$  \__/      | $$$$| $$  /$$$$$$   /$$$$$$  /$$$$$$/$$$$   /$$$$$$ | $$      | $$  \ $$ /$$$$$$   /$$$$$$   /$$$$$$
// | $$$$$$$$| $$/$$ $$ $$|  $$$$$$       | $$ $$ $$ /$$__  $$ /$$__  $$| $$_  $$_  $$ |____  $$| $$      | $$$$$$$/|____  $$ /$$__  $$ /$$__  $$
// | $$__  $$| $$$$_  $$$$ \____  $$      | $$  $$$$| $$  \ $$| $$  \__/| $$ \ $$ \ $$  /$$$$$$$| $$      | $$____/  /$$$$$$$| $$  \ $$| $$$$$$$$
// | $$  | $$| $$$/ \  $$$ /$$  \ $$      | $$\  $$$| $$  | $$| $$      | $$ | $$ | $$ /$$__  $$| $$      | $$      /$$__  $$| $$  | $$| $$_____/
// | $$  | $$| $$/   \  $$|  $$$$$$/      | $$ \  $$|  $$$$$$/| $$      | $$ | $$ | $$|  $$$$$$$| $$      | $$     |  $$$$$$$|  $$$$$$$|  $$$$$$$
// |__/  |__/|__/     \__/ \______/       |__/  \__/ \______/ |__/      |__/ |__/ |__/ \_______/|__/      |__/      \_______/ \____  $$ \_______/
//                                                                                                                            /$$  \ $$
//                                                                                                                           |  $$$$$$/
//                                                                                                                            \______/
//

function disablePaddingBlockEndStyles() {
  // Iterate through all stylesheets
  for (let i = 0; i < document.styleSheets.length; i++) {
    const styleSheet = document.styleSheets[i] as CSSStyleSheet;

    try {
      // Iterate through all CSS rules in the stylesheet
      for (let j = 0; j < styleSheet.cssRules.length; j++) {
        const rule = styleSheet.cssRules[j] as CSSStyleRule;

        // Check if the rule has a style property and contains "padding-block-end"
        if (rule.style && rule.style.paddingBlockEnd) {
          // Disable the padding-block-end style
          rule.style.paddingBlockEnd = '0';
          debugLog('Disabled padding-block-end in stylesheet');
        }
      }
    } catch (e) {
      if (e.name === 'SecurityError') {
        //console.warn(`Could not access stylesheet: ${styleSheet.href} due to cross-origin restrictions`);
      } else {
        console.error(`Could not access stylesheet: ${styleSheet.href}`, e);
      }
    }
  }
  // Disable padding-block-end in inline styles
  const allElements = document.querySelectorAll('*');
  allElements.forEach((element) => {
    const el = element as HTMLElement;
    if (el.style.paddingBlockEnd) {
      el.style.paddingBlockEnd = '0';
      debugLog('Disabled padding-block-end in inline styles');
    }
  });
  debugLog('Disabled padding-block-end styles');
}

function addAccountDetailsToPage(accountId: string) {
  if (accountId) {
    console.log(`Account No Found on New Page ${accountId}`);
    getAccount(accountId)
      .then((accountDetails: AccountDetails) => {
        let elementAWSConsoleTables: HTMLElement;
        if (document.getElementById('awsconsolelables')) {
          elementAWSConsoleTables = document.getElementById('awsconsolelables');
        } else if (document.getElementById('nav-usernameMenu')) {
          elementAWSConsoleTables = document.getElementById('nav-usernameMenu');
        } else {
          elementAWSConsoleTables = document.createElement('div') as HTMLDivElement;
          elementAWSConsoleTables.id = 'awsconsolelables';
          elementAWSConsoleTables.classList.add('awsconsolelables');
          document.querySelectorAll('header')[0].querySelectorAll('nav')[0].prepend(elementAWSConsoleTables);
        }
        let elementAccountName: HTMLElement;
        if (document.getElementById('awsconsolelables_name')) {
          elementAccountName = document.getElementById('awsconsolelables_name');
        } else {
          elementAccountName = document.createElement('div') as HTMLDivElement;
          elementAccountName.id = 'awsconsolelables_name';
          elementAccountName.classList.add('name');
          elementAWSConsoleTables.appendChild(elementAccountName);
        }

        if (accountDetails.id) {
          elementAccountName.innerText = accountDetails.id;
        } else {
          elementAccountName.innerText = 'UnKnown';
        }

        if (accountDetails.color) {
          elementAccountName.style.setProperty('color', (accountDetails as AccountDetails).color, 'important');
        }

        if (accountDetails.background) {
          elementAccountName.style.background = (accountDetails as AccountDetails).background;
        }

        if (accountDetails.headerBackground) {
          document.querySelectorAll('header')[0].style.background = (accountDetails as AccountDetails).headerBackground;
        }

        if (accountDetails.headerColor) {
          (document.querySelectorAll('[data-testid="awsc-nav-account-menu-button"]')[0] as HTMLDivElement).style.setProperty(
            'color',
            accountDetails.headerColor,
            'important'
          );
          (document.querySelectorAll('[data-testid="awsc-nav-regions-menu-button"]')[0] as HTMLDivElement).style.setProperty(
            'color',
            accountDetails.headerColor,
            'important'
          );
          (document.querySelectorAll('[data-testid="awsc-nav-support-menu-button"]')[0] as HTMLDivElement).style.setProperty(
            'color',
            accountDetails.headerColor,
            'important'
          );
          (document.querySelectorAll('[data-testid="aws-services-list-button"]')[0] as HTMLDivElement).style.setProperty(
            'color',
            accountDetails.headerColor,
            'important'
          );
        }
      })
      .catch((e) => console.error(e));
  } else {
    console.warn('Unable to find Account Id');
  }
}
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function getAWSUserInfoAccountNumber(): string | null {
  const cookieValue = getCookie('aws-userInfo');
  if (cookieValue) {
    try {
      const userInfo = JSON.parse(decodeURIComponent(cookieValue));
      const arn = userInfo.arn;
      if (arn) {
        const match = arn.match(/arn:aws:sts::(\d+):/);
        return match ? match[1] : null;
      }
    } catch (error) {
      console.error('Error parsing aws-userInfo cookie:', error);
      return null;
    }
  }
  return null;
}

if (!window.location.href.includes('awsapps.com/start')) {
  isElementLoaded('[data-testid="awsc-nav-regions-menu-button"]').then((selector) => {
    const accountNumber = getAWSUserInfoAccountNumber();
    addAccountDetailsToPage(accountNumber);
  });
}
function waitForPageComplete(): Promise<void> {
  return new Promise<void>((resolve) => {
    let timeout;
    const observer = new MutationObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        observer.disconnect();
        resolve();
      }, 1000);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
  });
}

async function afterPageProcessing() {
  await waitForPageComplete();
  getAdditionalLinks().then((accountDetails: IAdditionalLinks) => {
    if (accountDetails.preferences.awsConsole.compressMode) {
      disablePaddingBlockEndStyles();
    }
  });
}

afterPageProcessing();

//   /$$$$$$  /$$      /$$  /$$$$$$         /$$$$$$                                          /$$                  /$$$$$$   /$$$$$$   /$$$$$$        /$$$$$$$
//  /$$__  $$| $$  /$ | $$ /$$__  $$       /$$__  $$                                        | $$                 /$$__  $$ /$$__  $$ /$$__  $$      | $$__  $$
// | $$  \ $$| $$ /$$$| $$| $$  \__/      | $$  \__/  /$$$$$$  /$$$$$$$   /$$$$$$$  /$$$$$$ | $$  /$$$$$$       | $$  \__/| $$  \__/| $$  \ $$      | $$  \ $$ /$$$$$$   /$$$$$$   /$$$$$$
// | $$$$$$$$| $$/$$ $$ $$|  $$$$$$       | $$       /$$__  $$| $$__  $$ /$$_____/ /$$__  $$| $$ /$$__  $$      |  $$$$$$ |  $$$$$$ | $$  | $$      | $$$$$$$/|____  $$ /$$__  $$ /$$__  $$
// | $$__  $$| $$$$_  $$$$ \____  $$      | $$      | $$  \ $$| $$  \ $$|  $$$$$$ | $$  \ $$| $$| $$$$$$$$       \____  $$ \____  $$| $$  | $$      | $$____/  /$$$$$$$| $$  \ $$| $$$$$$$$
// | $$  | $$| $$$/ \  $$$ /$$  \ $$      | $$    $$| $$  | $$| $$  | $$ \____  $$| $$  | $$| $$| $$_____/       /$$  \ $$ /$$  \ $$| $$  | $$      | $$      /$$__  $$| $$  | $$| $$_____/
// | $$  | $$| $$/   \  $$|  $$$$$$/      |  $$$$$$/|  $$$$$$/| $$  | $$ /$$$$$$$/|  $$$$$$/| $$|  $$$$$$$      |  $$$$$$/|  $$$$$$/|  $$$$$$/      | $$     |  $$$$$$$|  $$$$$$$|  $$$$$$$
// |__/  |__/|__/     \__/ \______/        \______/  \______/ |__/  |__/|_______/  \______/ |__/ \_______/       \______/  \______/  \______/       |__/      \_______/ \____  $$ \_______/
//                                                                                                                                                                      /$$  \ $$
//                                                                                                                                                                     |  $$$$$$/
//                                                                                                                                                                      \______/

if (window.location.href.includes('awsapps.com/start')) {
  const handleAccountList = (dataBlock: Element) => {
    const newJsonData = {};
    Array.from(dataBlock.children).forEach((element) => {
      const accountNameElement = element.querySelector('strong').querySelector('div').innerHTML;
      const accountName = accountNameElement ? accountNameElement : 'Unknown Account Name';

      let accountNumber = 'Unknown Account Number';
      element.querySelectorAll('div').forEach((divElement) => {
        if (divElement.textContent.includes(' | ')) {
          const accountInfoParts = divElement.textContent.split(' | ');
          accountNumber = accountInfoParts.length > 0 ? accountInfoParts[0] : 'Unknown Account Number';
          accountNumber = accountNumber.trim();
        }
      });
      console.log(`Account Name: ${accountName}, Account Number: ${accountNumber}`);
      newJsonData[accountNumber] = {
        id: accountName,
        color: '#57f104',
      };
    });
    getAllAccounts().then((jsonData: any) => {
      saveAllAccounts({ ...jsonData, ...newJsonData });
      getAllAccounts();
    });
  };

  // Create a MutationObserver to watch for changes in the DOM
  const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        const accountListElement = document.querySelector('div[data-testid="account-list"]');
        if (accountListElement) {
          observer.disconnect();
          handleAccountList(accountListElement);
        }
      }
    }
  });
  // Start observing the document body for child list changes
  observer.observe(document.body, { childList: true, subtree: true });
}
