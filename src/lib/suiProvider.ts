//@ts-nocheck

import { providerRequests } from './suiRequests.js';
import { EventEmitter } from 'events';

export default class suiProvider extends EventEmitter {
  constructor() {
    window.addEventListener('message', (e) => {
      this.request(e.data);
    });
    super();
    this.selectedAddress = null;
    this.balance = 0;
    this._state = {
      accounts: [],
      isConnected: false,
      isUnlocked: false,
      initialized: false,
      isPermanentlyDisconnected: false,
    };
    this.initializeState();
    this.on('connect', () => {
      if (!this._state || !this._state.isConnected) {
        // TODO: add session logic
        this._state.isConnected = true;
      }
    });
    console.log('initial', this);
  }

  async initializeState() {
    console.log('HERE?');
    //Won't work because we don't have chrome storage -> move to local storage, if we don't want to open app
    // let { accounts } = (await this.getProviderState()).state;
    let accounts = [];

    try {
      console.log('Bruh?');
      this._state.isUnlocked = true;
      this._state.initialized = true;
    } catch (e) {
      console.error(e);
    }

    console.warn('here');

    console.log('%c \n SUI CRADLE IS UP\n', 'background: #222; color: #2255f0');
  }

  async request(args) {
    // console.log("REQUEST", args);
    return providerRequests(this, args);
  }

  isConnected() {
    return this._state.isConnected;
  }

  // Helpers
  async getProviderState() {
    return getStateHelper(this, 'sui');
  }

  async setProviderState(params, type) {
    return setStateHelper(this, params, type);
  }

  async rpcStream(method, params, chainId) {
    //Instead of sending to relay, we need to open this in the deeplink
    return await sendViaRelay({
      name: 'suiRpc',
      body: {
        method,
        params,
        chainId,
      },
    });
  }

  async providerResponse(method, data) {
    //Probably useless
    window.postMessage({
      method: method + 'Response',
      isResponse: true,
      response: data,
    });
  }

  // Private methods
  _handleConnect(chainId) {
    handleConnectHelper(this, chainId);
  }

  _handleDisconnect(isRecoverable, errorMessage) {
    handleDisconnectHelper(this, isRecoverable, errorMessage);
  }
}
