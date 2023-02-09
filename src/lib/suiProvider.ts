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
    //Won't work because we don't have chrome storage -> move to local storage, if we don't want to open app
    // let { accounts } = (await this.getProviderState()).state;
    let accounts = [];

    try {
      this._state.isUnlocked = true;
      this._state.initialized = true;
    } catch (e) {
      console.error(e);
    }

    console.warn('here');

    console.log('%c \n SUI CRADLE IS UP\n', 'color: #2255f0');

    this.emit('connect');
  }

  async request(args) {
    // console.log("REQUEST", args);
    return providerRequests(this, args);
  }

  isConnected() {
    return this._state.isConnected;
  }

  async providerResponse(method, data) {
    //Probably useless
    window.postMessage({
      method: method + 'Response',
      isResponse: true,
      response: data,
    });
  }
}
