import type { JsonRpcRequest } from './types';

export async function enableHelper(provider): Promise<any> {
	console.warn('CRADLE: enable() is deprecated but website uses it.');
	return await provider.request({
		method: 'eth_requestAccounts',
	});
}

// TODO: improve types
export function sendHelper(
	provider,
	methodOrPayload: string | JsonRpcRequest,
	callbackOrArgs?: any
): Promise<any> {
	console.warn(
		'CRADLE: send() is deprecated but website sends:',
		methodOrPayload,
		callbackOrArgs
	);
	if (
		typeof methodOrPayload === 'string' &&
		(!callbackOrArgs || Array.isArray(callbackOrArgs))
	) {
		return new Promise((resolve, reject) => {
			try {
				provider
					.request({
						method: methodOrPayload,
						params: callbackOrArgs,
					})
					.then((response) => resolve(response));
			} catch (error) {
				reject(error);
			}
		});
	} else if (
		methodOrPayload &&
		typeof methodOrPayload === 'object' &&
		typeof callbackOrArgs === 'function'
	) {
		return new Promise((resolve, reject) => {
			try {
				provider.request(methodOrPayload).then((response) => {
					callbackOrArgs(null, {
						result: response,
						jsonrpc: '2.0',
						method: methodOrPayload.method,
						id: methodOrPayload.id,
					});
					resolve(response);
				});
			} catch (error) {
				reject(error);
			}
		});
	} else if (typeof methodOrPayload === 'object') {
		return new Promise((resolve, reject) => {
			provider.request(methodOrPayload).then((response) => {
				resolve(response);
			});
		});
	}

	return new Promise((resolve, reject) => {
		console.error('CRADLE: UNIMPLEMENTED CASE');
		resolve(null);
	});
}

export async function sendAsyncHelper(
	provider,
	payload: JsonRpcRequest,
	callback: any
): Promise<any> {
	console.warn(
		'sendAsync() is deprecated but website sends:',
		payload,
		callback
	);
	let { id, method, params } = payload;
	return new Promise((resolve, reject) => {
		try {
			provider.request({ method, params }).then((result) => {
				callback(null, {
					result,
					jsonrpc: '2.0',
					method,
					id,
				});
				resolve(result);
			});
		} catch (error) {
			reject(error);
		}
	});
}
