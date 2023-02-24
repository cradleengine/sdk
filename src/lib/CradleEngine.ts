import { initializeProvider } from './initialize';

export const CradleEngine = () => {
  /**
   * @returns true
   * @anotherNote Initializes CradleEngine
   */
  const initialize = (flags = { useEmbedded: true }) => {
    return initializeProvider(flags);
  };

  return {
    initialize,
  };
};
