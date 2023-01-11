/**
 * @param value - Comment describing the `value` parameter.
 * @returns Comment describing the return type.
 * @anotherNote Some other value.
 */
export const connectWallet = (value: number) => {
  window.open(`cradlewallet://connectWallet/example/1?hostname=${window.location.hostname}`);
};