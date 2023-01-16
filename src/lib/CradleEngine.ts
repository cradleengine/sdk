import { debug } from './helpers/logger';
import { initializeProvider } from './provider/initialize';

export const CradleEngine = () => {
  const _provider = initializeProvider();
  /**
   * @returns true
   * @anotherNote opens cradle app
   */
  const connectCradleWallet = () => {
    debug.log('@PROVIDER', _provider);
    if (window) {
      window.open(
        `cradlewallet://connectWallet/example/1?hostname=${window.location.hostname}`
      );
      _provider.emit('accountsChanged', [
        '0x677e813fee748f9467de2f00a5ad9d1d8cf365bb',
      ]);
    } else {
      console.log('window does not exist');
    }
    return true;
  };

  return {
    connectCradleWallet,
    provider: _provider,
  };
};
