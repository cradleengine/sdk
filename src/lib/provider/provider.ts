import {
    handleAccountsChangedHelper,
    handleChainChangedHelper,
    handleConnectHelper,
    handleDisconnectHelper,
} from './handlers';
import { sendHelper, sendAsyncHelper, enableHelper } from './legacyMethods';
import { providerRequests } from './providerRequest';
import { getStateHelper, setStateHelper } from './stateCommunication';
import type { ProviderState, JsonRpcRequest, RequestArguments } from './types';
// import { sendViaRelay } from "@plasmohq/messaging";

import { EventEmitter } from 'events';
import { gameSiteDomains } from '../helpers/gameSites';
import { debug } from '../helpers/logger';

export default class CradleProvider extends EventEmitter {
    protected _state: ProviderState;
    protected static _defaultState: ProviderState;
    chainId: string | null;
    balance: number | null;
    selectedAddress: string | null;
    selectedSuiAddress: string | null;
    isMetaMask: boolean | null;
    networkVersion: string | null;
    autoRefreshOnNetworkChange: boolean | null;

    constructor() {
        window.addEventListener('message', (e) => {
            this.request(e.data);
        });
        super();
        this.initializeState();
        this.chainId = null;
        this.selectedAddress = null;
        this.selectedSuiAddress = null;
        this.balance = 0;
        this.isMetaMask = true;
        this.networkVersion = null;
        this.autoRefreshOnNetworkChange = false;
        this._state = Object.assign({}, CradleProvider._defaultState);
        this.on('connect', () => {
            // TODO: move to seperate folder
            if (!this._state || !this._state.isConnected) {
                //Do this to prevent duplicate sessions
                gameSiteDomains.some((gameSite) => {
                    const gameName = gameSite.name.toLowerCase();
                    const gameDomain = gameSite.domain.toLowerCase();
                    const whiteListCheck =
                        window.location.hostname.includes(gameName) ||
                        window.location.hostname.includes(gameDomain) ||
                        gameDomain.includes(window.location.hostname) ||
                        gameName.includes(window.location.hostname) ||
                        window.location.href.includes(gameDomain) ||
                        window.location.href.includes(gameName) ||
                        gameDomain.includes(window.location.href) ||
                        gameName.includes(window.location.href);
                    console.log(
                        whiteListCheck,
                        window.location.hostname,
                        gameSite.name,
                        gameSite.domain
                    );
                    if (whiteListCheck) {
                        //Start tracking session
                        console.log('Starting session');
                        // sendViaRelay({
                        // 	name: "session",
                        // 	body: {
                        // 		method: "startSession",
                        // 		params: {
                        // 			game: gameSite.name,
                        // 			game_url: gameSite.domain,
                        // 			start_time: new Date().getTime(),
                        // 			parent: parent.location.href,
                        // 			origin: window.location.href,
                        // 		},
                        // 	},
                        // }).then((res) => {
                        // 	const session_id = res.session_id;
                        // 	if (session_id) {
                        // 		console.log(session_id);
                        // 		window.setInterval(
                        // 			() => updateSession(this),
                        // 			60000
                        // 		);

                        // 		function updateSession(that) {
                        // 			//Update session
                        // 			const end_time = new Date().getTime();
                        // 			sendViaRelay({
                        // 				name: "session",
                        // 				body: {
                        // 					method: "endSession",
                        // 					params: {
                        // 						session_id,
                        // 						game_url: gameSite.domain,
                        // 						end_time,
                        // 						hidden: document.hidden,
                        // 					},
                        // 				},
                        // 			});
                        // 		}
                        // 	}
                        // });
                    }
                });
                this._state.isConnected = true;
            }
        });
        debug.log('initial', this);
    }

    async initializeState(): Promise<any> {
        let { chainId, accounts, networkVersion } = (await this.getProviderState())
            .state;

        this.emit('connect', { chainId });
        if (accounts) this._handleAccountsChanged(accounts);
        this._handleChainChanged({
            chainId,
            networkVersion,
        });

        this._state.isUnlocked = true;
        this._state.initialized = true;

        this.emit('_initialized');

        debug.log('%c \n CRADLE IS UP\n', 'background: #222; color: #2255f0');
    }

    // function used to get data from our provider (ex. send_txn, chain_id, address, eth_call, block_number, etc)
    async request(args: RequestArguments): Promise<any> {
        // debug.log("REQUEST", args);
        return providerRequests(this, args);
    }

    isConnected(): boolean {
        return this._state.isConnected;
    }

    // Helpers
    async getProviderState(): Promise<any> {
        return getStateHelper(this);
    }

    async setProviderState(
        params: any,
        type: 'accounts' | 'chain'
    ): Promise<any> {
        return setStateHelper(this, params, type);
    }

    async rpcStream(
        method: string,
        params: RequestArguments | any = [],
        chainId?: string | null
    ): Promise<any> {
        if (!chainId) {
            chainId = this.chainId;
        }
        debug.log(method, params, chainId);
        // return await sendViaRelay({
        //     name: "rpc",
        //     body: {
        //         method,
        //         params,
        //         chainId,
        //     },
        // });
    }

    async providerResponse(method: string, data: any): Promise<any> {
        window.postMessage({
            method: method + 'Response',
            isResponse: true,
            response: data,
        });
    }

    // TODO: figure out way for switching chains

    // Legacy Methods
    async enable(): Promise<any> {
        return enableHelper(this);
    }

    send(
        methodOrPayload: string | JsonRpcRequest,
        callbackOrArgs?: any
    ): Promise<any> {
        return sendHelper(this, methodOrPayload, callbackOrArgs);
    }

    async sendAsync(payload: JsonRpcRequest, callback: any): Promise<any> {
        return sendAsyncHelper(this, payload, callback);
    }

    // Private methods
    protected _handleConnect(chainId: string) {
        handleConnectHelper(this, chainId);
    }

    protected _handleDisconnect(isRecoverable: boolean, errorMessage?: string) {
        handleDisconnectHelper(this, isRecoverable, errorMessage);
    }

    protected _handleAccountsChanged(
        accounts: string[] | null | undefined,
        isEthAccounts = false
    ): void {
        handleAccountsChangedHelper(this, accounts, isEthAccounts);
    }

    protected _handleChainChanged({
        chainId,
        networkVersion,
    }: { chainId?: string | null; networkVersion?: string | null } = {}) {
        handleChainChangedHelper(this, chainId, networkVersion);
    }
}
