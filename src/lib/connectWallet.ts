/**
 * @returns true
 * @anotherNote opens cradle app
 */
export const connectWallet = () => {
  if (window) {
    window.open(
      `cradlewallet://connectWallet/example/1?hostname=${window.location.hostname}`
    );
  } else {
    console.log('window does not exist');
  }
  return true;
};
