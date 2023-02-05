import { initializeProvider } from './provider/initialize';

export const CradleEngine = () => {
  /**
   * @returns true
   * @anotherNote Initializes CradleEngine
   */
  const initialize = () => {
    const _provider = initializeProvider();
    return _provider;
  };

  return {
    initialize,
  };
};
