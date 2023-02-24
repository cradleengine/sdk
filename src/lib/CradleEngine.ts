import { initializeProvider } from './initialize';

export const CradleEngine = () => {
  /**
   * @returns true
   * @anotherNote Initializes CradleEngine
   */
  const initialize = (flags={}) => {
    return initializeProvider(flags);
  };

  return {
    initialize,
  };
};
