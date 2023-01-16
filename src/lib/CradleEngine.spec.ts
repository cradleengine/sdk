import test from 'ava';
import { CradleEngine } from './CradleEngine';
import CradleProvider from './provider/provider';

test('CradleEngineHasProvider', (t) => {
  const engine = CradleEngine();
  console.log(engine.provider.getProviderState());
  t.is(typeof engine.provider, typeof CradleProvider);
});
