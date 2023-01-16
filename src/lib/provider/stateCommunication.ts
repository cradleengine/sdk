// import { sendViaRelay } from "@plasmohq/messaging";
import { debug } from '../helpers/logger';

export async function getStateHelper(provider): Promise<any> {
	return new Promise(async (resolve) => {
		debug.log('CALLING provider Stream', provider);
		// const initialProviderState = await sendViaRelay({
		// 	name: "state",
		// 	body: {
		// 		method: "getProviderState",
		// 		params: { origin: window.location.href },
		// 	},
		// 	relayId: "getProviderState",
		// });
		const initialProviderState = {
			chainId: '0x1',
			accounts: ['0x677e813fee748f9467de2f00a5ad9d1d8cf365bb'],
			networkVersion: '0x1',
		};
		debug.log('INIT STATE', initialProviderState);
		resolve(initialProviderState);
	});
}

export async function setStateHelper(
	provider,
	params: any,
	type: 'accounts' | 'chain'
): Promise<any> {
	return new Promise(async (resolve) => {
		debug.log('Trying to set State', provider, params, type);
		// let methodName =
		// 	'setProviderState' + (type === 'accounts' ? 'Accounts' : 'Chain');
		// const providerState = await sendViaRelay({
		// 	name: "state",
		// 	body: {
		// 		method: methodName,
		// 		params,
		// 	},
		// 	relayId: methodName,
		// });
		const providerState = {
			chainId: '0x1',
			accounts: ['0x677e813fee748f9467de2f00a5ad9d1d8cf365bb'],
			networkVersion: '0x1',
		};
		resolve(providerState);
	});
}
