/**
 * @returns true
 * @anotherNote opens cradle app
 */
export const connectWallet = () => {
  window.open(
    `cradlewallet://connectWallet/example/1?hostname=${window.location.hostname}`
  );
  return true;
};
