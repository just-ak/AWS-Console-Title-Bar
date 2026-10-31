# AWS Console Title Bar

[https://aws-console-title-bar.akfdev.com](https://aws-console-title-bar.akfdev.com)

Chrome Plugin: [AWS Console Title Bar](https://chrome.google.com/webstore/detail/aws-console-title-bar/jhenfbkjfncfbimbkhakchbdefigenfp?hl=en)

FireFox Plugin [AWS Console Title Bar](https://addons.mozilla.org/en-GB/firefox/addon/aws-console-title-bar/)

The AWS Console Title Bar is a plugin designed to assist users of the AWS Console with SSO who have multiple accounts. It helps them identify the account they are currently logged into by displaying the account name on the menu bar in the console's top right corner.

To allow the plugin to work on each AWS Console URL, follow these steps:

1. Install the plugin.
2. Open the AWS Console.
3. Click on the plugin icon in the browser's toolbar. It will have a green dot on it.
4. From the drop-down menu, select "Allow on all AWS Console URLs" or a similar option. This will ensure that the plugin works consistently across different AWS Console URLs.

## Export / Import of URLs

The plugin supports exporting and importing URLs. The following JSON structure can be used for exporting and importing URLs:

```json
{
  "urls": [
    { "url": "https://akfdev.com", "title": "AKFDEV.con" },
    {
      "url": "https://akfdev.awsapps.com/start",
      "title": "AWS Console: just-ak"
    },
    {
      "url": "https://d-9c6715bd19.awsapps.com/start",
      "title": "AWS Console : TORG"
    }
  ]
}
```

## Development

### Development Environment Setup

To set up your development environment with oh-my-zsh, powerlevel10k, npm, and nvm, follow these steps:

1. **Install oh-my-zsh**:

   ```sh
   sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
   ```

2. **Install powerlevel10k**:

   ```sh
   git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
   ```

3. **Set powerlevel10k as the ZSH theme**:
   Edit your `.zshrc` file and set `ZSH_THEME="powerlevel10k/powerlevel10k"`.

4. **Install nvm**:

   ```sh
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
   ```

5. **Load nvm and install the correct Node.js version**:
   Add the following lines to your `.zshrc` file to load nvm and use the Node.js version specified in the `.nvmrc` file:

   ```sh
   export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
   [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # This loads nvm bash_completion

   # Load the correct Node.js version from .nvmrc
   autoload -U add-zsh-hook
   load-nvmrc() {
     local node_version="$(nvm version)"
     local nvmrc_path="$(nvm_find_nvmrc)"

     if [ -n "$nvmrc_path" ]; then
       local nvmrc_node_version=$(nvm version "$(cat "${nvmrc_path}")")

       if [ "$nvmrc_node_version" = "N/A" ]; then
         nvm install
       elif [ "$nvmrc_node_version" != "$node_version" ]; then
         nvm use
       fi
     elif [ "$node_version" != "$(nvm version default)" ]; then
       echo "Reverting to nvm default version"
       nvm use default
     fi
   }
   add-zsh-hook chpwd load-nvmrc
   load-nvmrc
   ```

6. **Install npm**:

   ```sh
   nvm install --lts/iron
   nvm use --lts/iron
   ```

7. **Verify the installation**:
   ```sh
   node -v
   npm -v
   ```

### Firefox

To submit the extension to Firefox, visit [https://addons.mozilla.org/en-US/developers/addons](https://addons.mozilla.org/en-US/developers/addons).

For debugging, access [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox) and use the Inspect option within the plugins section. Here's an example screenshot of how to access it:

![Inspect](./docs/FirefoxDebug.png)

Submit the extension at [https://addons.mozilla.org/en-US/developers/addon/aws-console-title-bar/versions/submit/](https://addons.mozilla.org/en-US/developers/addon/aws-console-title-bar/versions/submit/).

### Chrome

For Chrome development, go to [chrome://extensions/](chrome://extensions/) and turn on Developer Mode. Then, load the unpacked extension.

Access the Chrome Web Store for more information:

- [https://chrome.google.com/webstore/devconsole/80050481-57f7-4a10-8bb4-7e6dfe5bec47/jhenfbkjfncfbimbkhakchbdefigenfp/edit/package](https://chrome.google.com/webstore/devconsole/80050481-57f7-4a10-8bb4-7e6dfe5bec47/jhenfbkjfncfbimbkhakchbdefigenfp/edit/package)

## Issues

https://github.com/just-ak/AWS-Console-Tittle-Bar/issues

## Manifest V3 Migration

For information on migrating to Manifest V3 in Chrome extensions, refer to [https://developer.chrome.com/docs/extensions/migrating/to-service-workers/#move-dom-and-window](https://developer.chrome.com/docs/extensions/migrating/to-service-workers/#move-dom-and-window).

## Website Promotion

Visit our website for more information and updates: [AWS Console Title Bar Website](https://aws-console-title-bar.akfdev.com)
