export const CradleEngine = () => {
  /**
   * @returns true
   * @anotherNote opens cradle app
   */
  const connectCradleWallet = (provider) => {
    if (window) {
      window.open(
        `cradlewallet://connectWallet/example/1?hostname=${window.location.hostname}`
      );
      provider.emit('accountsChanged', [
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
