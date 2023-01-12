import { EventEmitter } from 'events';

export const CradleEngine = () => {
  const _eventEmitter = new EventEmitter();

  /**
   * @returns true
   * @anotherNote opens cradle app
   */
  const connectCradleWallet = () => {
    if (window) {
      window.open(
        `cradlewallet://connectWallet/example/1?hostname=${window.location.hostname}`
      );
      _eventEmitter.emit('accountsChanged', [
        '0x677e813fee748f9467de2f00a5ad9d1d8cf365bb',
      ]);
    } else {
      console.log('window does not exist');
    }
    return true;
  };

  return {
    connectCradleWallet,
  };
};
