//@ts-nocheck
const CONVERSION_FACTOR = 10 ** 9;

const getDomain = (siteURL) => {
  try {
    let URLObject = new URL(siteURL);
    return URLObject.hostname;
  } catch (e) {}
};

const generateDeeplink = (uniqueId, requestedMethod, params) => {
  return `cradlewallet://${uniqueId}?requestedMethod=${requestedMethod}&params=${JSON.stringify(
    params
  )}&metadata=${JSON.stringify(getSiteMetadata())}`;
};

const getSiteMetadata = () => {
  const siteUrl = window.location.origin;
  return {
    name: document.title,
    url: siteUrl,
    icon: 'https://logo.clearbit.com/' + getDomain(siteUrl),
  };
};

export function providerRequests(provider, args, callback = () => {}) {
  window.suiSocket.disconnect();
  return new Promise(async (resolve, reject) => {
    if (args.method === 'connectWallet') {
      const stored_addr = window.localStorage.getItem('cradleAddress');
      if (stored_addr) {
        window.sui.selectedAddress = stored_addr;
        resolve(stored_addr);
        return;
      }
    }
    if (args.method === 'disconnectWallet') {
      window.localStorage.removeItem('cradleAddress');
      window.sui.selectedAddress = null;
      window.sui.balance = 0;
      resolve(true);
      return;
    }

    if (args.method) {
      const deepLink = generateDeeplink(
        window.suiRoomId,
        args.method,
        args.params
      );
      window.location.href = deepLink;
    }

    window.suiSocket.on('messageToDapp', async (result) => {
      console.log('Message received', result);
      const { method, payload } = result;
      if (args.method === 'paySui' && method === 'paySuiResponse') {
        resolve(payload.txnHash);
      } else if (
        args.method === 'connectWallet' &&
        method === 'connectWalletResponse'
      ) {
        window.sui.selectedAddress = payload.address;
        if (!(args.params && args.params.persists === false)) {
          window.localStorage.setItem('cradleAddress', payload.address);
        }
        resolve(payload.address);
      } else if (
        args.method === 'signAndExecute' &&
        method === 'signAndExecuteResponse'
      ) {
        resolve(payload.txnHash);
      } else if (args.method === 'moveCall' && method === 'moveCallResponse') {
        resolve(payload.txnHash);
      }
    });
  });
}
