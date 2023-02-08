import { initializeProvider } from './initialize';

export const CradleEngine = () => {
  /**
   * @returns true
   * @anotherNote Initializes CradleEngine
   */
  const initialize = () => {
    return initializeProvider();
  };

  return {
    initialize,
  };
};
