const getColorFromName = (name: string): string => {
  const colors = ['blue', 'turquoise', 'green', 'yellow', 'orange', 'red', 'pink', 'purple', 'toolbar'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getIconFromName = (name: string): string => {
  const icons = [
    'fingerprint',
    'briefcase',
    'dollar',
    'cart',
    'circle',
    'gift',
    'vacation',
    'food',
    'fruit',
    'pet',
    'tree',
    'chill',
    'fence',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % icons.length;
  return icons[index];
};

export const createContainer = (group: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (typeof browser !== 'undefined' && browser.contextualIdentities) {
      const color = getColorFromName(group);
      const icon = getIconFromName(group);
      browser.contextualIdentities
        .create({
          name: `${group}`,
          color: color,
          icon: icon,
        })
        .then((identity) => {
          resolve(identity.cookieStoreId);
        })
        .catch((error) => {
          console.error('Error creating container:', error);
          reject(error);
        });
    } else {
      console.error('contextualIdentities API is not supported');
      reject('contextualIdentities API is not supported');
    }
  });
};
