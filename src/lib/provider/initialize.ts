import { debug } from '../helpers/logger';

import CradleProvider from './provider';
// import { sendViaRelay } from "@plasmohq/messaging";

declare global {
  interface Window {
    cradle: CradleProvider;
    ethereum: CradleProvider;
  }
}

const getIp = () => {
  //Get IP address
  debug.log('OKEY');
  return new Promise((resolve, reject) => {
    fetch('https://api.ipify.org?format=json')
      .then((response) => response.json())
      .then((data) => {
        debug.log('YEHU');
        resolve(data.ip);
      })
      .catch((error) => {
        debug.log('BREH');
        reject(error);
      });
  });
};

export const metamaskCheck = () => {
  const urlBase = 'chrome-extension://'; // this prefix is used since we are accessing an extension
  const metamaskWalletExtensionID = 'nkbihfbeogaeaoehlefnkodbefgpgknn'; // the extension's unique ID
  const webAccessibleResource = '/inpage.js';

  const metamaskWebAccessibleFile =
    urlBase + metamaskWalletExtensionID + webAccessibleResource;

  debug.log('MM File', metamaskWebAccessibleFile);

  const doesFileExist = (fileUrl) => {
    // check if we can open the file...
    try {
      const xhr = new XMLHttpRequest();

      xhr.open('HEAD', fileUrl, false);
      xhr.send();

      debug.log('The file does exist.');
      return true;
    } catch (error) {
      if (error instanceof DOMException) {
        // if we encounter a DOMException, then assume the file doesn't exist.
        debug.log(
          "We got a DOMException. This means that the file doesn't exist."
        );
        return false;
      } else {
        // if we get a random error, then return that. We don't know what it means yet.
        debug.log(error);
        return error;
      }
    }
  };

  try {
    const result = doesFileExist(metamaskWebAccessibleFile);

    // check if the RoninWallet extension is installed...
    if (result) {
      debug.log('We assume that the Ronin Wallet extension exists.');
      return true;
    } else if (!result) {
      debug.log('The Ronin Wallet extension needs to be installed!');
      return false;
    } else {
      debug.log(result);
      return false;
    }
  } catch (error) {
    debug.log(error);
    return false;
  }
};

export function initializeProvider(): CradleProvider {
  debug.log('%c \nINITIALIZING CRADLE\n', 'background: #222; color: #2255f0');
  let provider = new CradleProvider();
  provider = new Proxy(provider, {
    // some common libraries, e.g. web3@1.x, mess with our API
    deleteProperty: () => true,
  });
  setGlobalProvider(provider, window);

  return provider;
}

function setGlobalProvider(provider: CradleProvider, window: Window): void {
  window.cradle = provider;
  if (!window.localStorage.getItem('cradleIpSet')) {
    getIp().then((r) => {
      debug.log('R', r);
      window.localStorage.setItem('cradleIpSet', 'true');
      // sendViaRelay({
      //     name: "storage",
      //     body: {
      //         ipAddress: r,
      //     },
      // }).then((response) => {
      //     debug.log("IP SET", response);
      // });
    });
  }

  // sendViaRelay({
  //     name: "state",
  //     body: {
  //         method: "useMetamask",
  //         params: { origin: window.location.href },
  //     },
  //     relayId: "useMetamask",
  // }).then((response) => {
  //     //If metamask is installed, only override the ethereum object if useMetamask is not set in storage
  //     if (!response.useMetamask) {
  window.ethereum = window.cradle;
  //     }
  // });

  window.dispatchEvent(new Event('ethereum#initialized'));
}

// initializeProvider();
