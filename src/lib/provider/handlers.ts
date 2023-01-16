import { compareAccounts } from '../helpers/compareAccounts';
import { debug } from '../helpers/logger';

export function handleConnectHelper(provider, chainId: string) {
	if (!provider._state.isConnected) {
		// provider.notificationRequest('walletConnected');
		provider.setConnectedStatus(true);
		provider.emit('connect', { chainId });
	}
}

export function handleDisconnectHelper(
	provider,
	isRecoverable: boolean,
	errorMessage?: string
) {
	if (errorMessage) {
		debug.log(errorMessage);
	}
	if (
		provider._state.isConnected ||
		(!provider._state.isPermanentlyDisconnected && !isRecoverable)
	) {
		provider.setConnectedStatus(false);
		let error;
		if (isRecoverable) {
			// error = new EthereumRpcError(
			//   1013, // Try again later
			//   errorMessage || messages.errors.disconnected(),
			// );
			error = 'disconnect error try again later';
			console.error(error);
		} else {
			// error = new EthereumRpcError(
			//   1011, // Internal error
			//   errorMessage || messages.errors.permanentlyDisconnected(),
			// );
			provider.chainId = null;
			provider._state.accounts = null;
			provider.selectedAddress = null;
			provider._state.isUnlocked = false;
			provider._state.isPermanentlyDisconnected = true;
		}
		provider.emit('disconnect', error);
		provider.emit('accountsChanged', null);
		provider.emit('close', error); // legacy method
		debug.warn('Disconnected');
	}
}

export function handleAccountsChangedHelper(
	provider,
	accounts: readonly string[] | null | undefined,
	isEthAccounts = false
): void {
	if (!accounts) {
		return;
	}

	// make sure given accounts in state are lowercased (to avoid duplicates)
	accounts = accounts
		? accounts.map((account) =>
			typeof account === 'string' ? account.toLowerCase() : account
		)
		: accounts;

	let _accounts = accounts;

	if (!Array.isArray(accounts)) {
		console.error(
			'Received invalid accounts parameter. Please report this bug.',
			accounts
		);
		_accounts = [];
	}

	for (const account of accounts) {
		if (typeof account !== 'string') {
			console.error(
				'Received non-string account. Please report this bug.',
				accounts
			);
			_accounts = [];
			break;
		}
	}

	// emit accountsChanged if anything about the accounts array has changed
	if (!compareAccounts(provider._state.accounts, _accounts)) {
		// we should always have the correct accounts even before eth_accounts
		// returns
		if (isEthAccounts && provider._state.accounts !== null) {
			debug.log('Null');
		}

		provider._state.accounts = _accounts as readonly string[];

		// handle selectedAddress
		if (provider.selectedAddress !== _accounts[0]) {
			provider.selectedAddress = (_accounts[0] as string) || null;
		}

		// finally, after all state has been updated, emit the event
		if (provider._state.initialized) {
			debug.warn('Accounts change emit');
			provider.emit('accountsChanged', _accounts);
		}
	}
	// keep providerState in background.ts consitent with current providerState
	provider.setProviderState(
		{
			accounts: provider._state.accounts,
			origin: window.location.origin,
		},
		'accounts'
	);
	provider._state.isConnected = true;
}

export function handleChainChangedHelper(provider, chainId, networkVersion) {
	if (
		!chainId ||
		typeof chainId !== 'string' ||
		!chainId.startsWith('0x') ||
		!networkVersion ||
		typeof networkVersion !== 'string'
	) {
		console.error(
			'MetaMask: Received invalid network parameters. Please report this bug.',
			{ chainId, networkVersion }
		);
		return;
	}

	provider._handleConnect(chainId);

	if (chainId !== provider.chainId) {
		provider.chainId = chainId;
		provider.networkVersion = networkVersion;
		if (provider._state.initialized) {
			// provider.notificationRequest('chainSwitch', {
			// 	chainId,
			// });
			provider.emit('chainChanged', provider.chainId);
			provider.emit('chainIdChanged', provider.chainId); // legacy method
			provider.emit('networkChanged', provider.networkVersion); // legacy method
		}
	}
}
