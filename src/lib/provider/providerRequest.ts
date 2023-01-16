// @ts-nocheck
import type { RequestArguments } from './types';
import { CHAIN_NOT_SUPPORTED_ERROR } from './types';
// import { sendViaRelay } from "@plasmohq/messaging";
// import { decrypt } from '../helpers/decrypt';
import { debug } from '../helpers/logger';
import { isChainId, isTransaction } from '../helpers/validation';

export function providerRequests(
    provider: any,
    args: RequestArguments
): Promise<any> {
    return new Promise(async (resolve, reject) => {
        if (args.method === 'sui_wallet_connect') {
            //Should switch the chain, and set the selectedSuiAddress
            // TODO: switch the chain?
            args.params = {
                isSui: true,
            };
            // const connectWallet = await sendViaRelay({
            //     name: "connectWallet",
            //     body: {
            //         params: {
            //             origin: window.parent.location.href,
            //             title: document.title,
            //             isSui: true,
            //         },
            //     },
            // });
            // provider.selectedSuiAddress = connectWallet.address;
            resolve('0x677e813fee748f9467de2f00a5ad9d1d8cf365bb');
        }
        if (args.method === 'getProviderState') {
            const providerState = await provider.getProviderState();
            resolve(providerState);
        } else if (args.method === 'switchAccounts') {
            await provider.setProviderState(
                {
                    ...args.params,
                    origin: window.location.href,
                },
                'accounts'
            );

            const accounts = []; // TODO: why do we set to empty array?
            provider._handleAccountsChanged(
                Array.isArray(accounts) ? accounts : [accounts]
            );
        } else if (args.method === 'getConnectionStatus') {
            debug.log('getConnection method called in provider');
            await provider.providerResponse('getConnectionStatus', {
                isConnected: provider.isConnected(),
            });
        } else if (args.method === 'disconnectSite') {
            provider._handleDisconnect(false, 'disconnectSite');
        } else if (args.method === 'eth_requestAccounts') {
            // let notificationResponse = await provider.notificationRequest(
            //     'walletConnected'
            // );
            // const isAuthenticated = await sendViaRelay({
            //     name: "storage",
            //     body: { method: "getStorage" },
            // });
            const isAuthenticated = {
                password: 'password',
            };
            if (
                provider._state.accounts &&
                provider._state.accounts.length > 0 &&
                isAuthenticated.password
            ) {
                resolve(provider._state.accounts);
            } else {
                // if accounts is undefined that means the intialization hasnt happened yet. Thus, just request accounts to obtain the accounts.
                // This is more of a band aid fix for one function. Ideal solution is to wrap request function so that it waits for intializeState to run.
                debug.log('ENTER INTO HERE');

                args.params = {
                    ...args.params,
                    origin: window.location.href,
                };
                debug.log('GOING TO SEND RELAY, TITLE:', document.title);
                const connectWallet = {
                    address: '0x677e813fee748f9467de2f00a5ad9d1d8cf365bb',
                };
                // const connectWallet = await sendViaRelay({
                //     name: "connectWallet",
                //     body: {
                //         params: {
                //             origin: window.parent.location.href,
                //             title: document.title,
                //             isSui: false,
                //         },
                //     },
                // });
                debug.log('RESP', connectWallet);
                const address = connectWallet.address.toLowerCase();
                args.params.accounts = [address];
                debug.log('ARGS', args);
                await provider.setProviderState(args.params, 'accounts');
                debug.log('Resolved?');
                // if the user rejects the wallet connect prompt
                if (address === 'userDecline') {
                    reject(new Error('User declined to connect wallet.'));
                } else {
                    // TODO: Add notification for selecting accounts
                    debug.log('WE HAVE DONE IT');
                    provider._handleAccountsChanged(
                        Array.isArray(address) ? address : [address]
                    );
                    debug.log('ABOUT TO RESOLVE', provider._state.accounts);
                    resolve(provider._state.accounts);
                }
            }
        } else if (
            args.method === 'eth-accounts' ||
            args.method === 'eth_accounts' ||
            args.method === 'wallet_getAccounts' ||
            args.method === 'wallet_ethAccounts'
        ) {
            // TODO: Add Await initializeState wrapper
            // const isAuthenticated = await sendViaRelay({
            //     name: "storage",
            //     body: { method: "getStorage" },
            // });
            const isAuthenticated = {
                password: 'password',
            };
            if (
                provider._state.accounts &&
                provider._state.accounts.length > 0 &&
                isAuthenticated.password
            ) {
                resolve(provider._state.accounts);
                debug.log('TRYTING TO SEND');
            } else {
                // if accounts is undefined that means the intialization hasnt happened yet. Thus, just request accounts to obtain the accounts.
                // This is more of a band aid fix for one function. Ideal solution is to wrap request function so that it waits for intializeState to run.
                let accounts = await provider.request({
                    method: 'eth_requestAccounts',
                });

                resolve(accounts);
            }
        } else if (args.method === 'eth_chainId') {
            // TODO: Add Await initializeState wrapper
            if (provider.chainId) {
                resolve(provider.chainId);
            } else {
                let providerState = await provider.getProviderState();
                resolve(providerState.state.chainId);
            }
        } else if (args.method === 'eth_blockNumber') {
            const response = await provider.rpcStream('getBlockNumber', args);
            resolve(response.number);
        } else if (args.method === 'eth_getBlockByNumber') {
            const response = await provider.rpcStream(
                'getBlockByNumber',
                args.params
            );
            debug.log('relay abstraction resp', response);
            resolve(response.block);
        } else if (args.method === 'eth_getBalance') {
            const response = await provider.rpcStream('getBalance', args.params);
            debug.log(response);
            provider.balance = response.balance;
            resolve(response.balance);
        } else if (args.method === 'eth_estimateGas') {
            resolve('21940'); // TODO: add proper logic
        } else if (args.method === 'net_version') {
            // TODO: Add Await initializeState wrapper
            if (provider.networkVersion) {
                resolve(provider.networkVersion);
            } else {
                let providerState = await provider.getProviderState();
                resolve(providerState.state.networkVersion);
            }
        } else if (args.method === 'selectedAddress') {
            resolve(provider._state.accounts);
        } else if (
            args.method === 'wallet_requestPermissions' ||
            args.method === 'wallet_getPermissions'
        ) {
            let responseObject = [
                {
                    invoker: window.location.hostname, //Switch invoker to site that makes request
                    parentCapability: 'eth_accounts',
                    caveats: [
                        {
                            type: 'filterResponse',
                            value: [provider.selectedAddress],
                        },
                    ],
                },
            ];
            resolve(responseObject);
        } else if (args.method === 'eth_sign' || args.method === 'personal_sign') {
            // const msgParams: any = args.params;
            // // if the method is personal_sign
            // let signVersion = 'personal_sign';
            // let fromAddress = msgParams[1];
            // let msg = decrypt(msgParams[0]);
            // // if the method is eth_sign
            // if (args.method === 'eth_sign') {
            //     /* signVersion = "eth_sign"; */
            //     fromAddress = msgParams[0];
            //     msg = msgParams[1];
            // }
            // // TODO: implement a more proper valid message hash function. this is pretty naive
            // let is_hashed = msg.substring(0, 2).toLowerCase() === '0x' ? true : false;

            // let msgForNotif = msg; // default just show the message

            // if (msgParams[2]) {
            //     // sometimes a third param is the text version of hashed message
            //     msgForNotif = msgParams[2];
            // }

            // const response = await sendViaRelay({
            //     name: "signMessage",
            //     body: {
            //         params: {
            //             address: provider.selectedAddress,
            //             balance: provider.balance,
            //             chainId: provider.chainId,
            //             message: msg,
            //             version: signVersion,
            //             is_hashed,
            //             origin: window.location.href,
            //             title: document.title,
            //         },
            //     },
            // });
            const response = {
                signature: 'signature',
            };

            if (response.signature === 'userDecline') {
                reject(new Error('User Declined Sign Message Prompt.'));
            } else {
                resolve(response.signature);
            }
        } else if (
            args.method === 'eth_signTypedData' ||
            args.method === 'eth_signTypedData_v3' ||
            args.method === 'eth_signTypedData_v4'
        ) {
            // const msgParams: any = args.params;
            // const version =
            //     args.method === 'eth_signTypedData'
            //         ? 'V1'
            //         : args.method === 'eth_signTypedData_v3'
            //             ? 'V3'
            //             : 'V4';
            // let message =
            //     args.method === 'eth_signTypedData' ? msgParams[0] : msgParams[1];
            // let from =
            //     args.method === 'eth_signTypedData' ? msgParams[1] : msgParams[0];

            const response = {
                signature: 'signature',
            };
            // const response = await sendViaRelay({
            //     name: "signMessage",
            //     body: {
            //         params: {
            //             address: provider.selectedAddress,
            //             balance: provider.balance,
            //             chainId: provider.chainId,
            //             message: message,
            //             version,
            //             is_hashed: false,
            //             origin: window.location.href,
            //             title: document.title,
            //         },
            //     },
            // });

            if (response.signature === 'userDecline') {
                reject(new Error('User Declined Sign Message Prompt.'));
            } else {
                resolve(response.signature);
            }
        } else if (args.method === 'eth_sendTransaction') {
            if (isTransaction(args.params)) {
                const txnParams = args.params[0];
                txnParams.gas = txnParams.gas || '75000000000';

                // const sendTransaction = await sendViaRelay({
                //     name: "sendTransaction",
                //     body: {
                //         popup: true,
                //         params: {
                //             ...txnParams,
                //             balance: provider.balance,
                //             chainId: provider.chainId,
                //             address: provider.selectedAddress,
                //             origin: window.location.href,
                //         },
                //         chainId: provider.chainId,
                //     },
                // });
                const sendTransaction = {
                    transaction: 'transaction',
                };
                resolve(sendTransaction.transaction);
                // }
            } else {
                resolve('Not A Transaction!');
            }
        } else if (args.method === 'personal_ecRecover') {
            const recoveredMessage = await provider.rpcStream(
                'recoverPersonalMessage',
                args.params
            );
            const sender = recoveredMessage?.sender;
            resolve(sender);
        } else if (
            args.method === 'wallet_switchEthereumChain' ||
            args.method === 'wallet_addEthereumChain'
        ) {
            debug.log('SWITCH CHAIN', args.params, isChainId(args.params));

            if (isChainId(args.params)) {
                const providerState = await provider.setProviderState(
                    {
                        origin: window.location.href,
                        chainId: args.params[0].chainId,
                        networkVersion: parseInt(args.params[0].chainId, 16).toString(),
                    },
                    'chain'
                );
                let { chainId, networkVersion } = providerState;
                provider._handleChainChanged({
                    chainId,
                    networkVersion,
                });
                resolve(provider.chainId);
            } else {
                //Spoof site to think we support chain
                if (args.params[0].chainId) {
                    const oldChain = provider.chainId;
                    provider._handleChainChanged({
                        chainId: args.params[0].chainId,
                        networkVersion: parseInt(args.params[0].chainId, 16).toString(),
                    });
                    resolve(provider.chainId);

                    //Switch back to a supported chain
                    providerRequests(provider, {
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: oldChain }],
                        isSui: false,
                    });
                    return;
                } else {
                    resolve(CHAIN_NOT_SUPPORTED_ERROR);
                }
            }
        } else if (args.method === 'eth_getTransactionCount') {
            const response = await provider.rpcStream('getTransactionCount', [
                provider.selectedAddress,
            ]);
            resolve(response.count);
        } else if (args.method === 'eth_getTransactionByHash') {
            const response = await provider.rpcStream(
                'getTransactionByHash',
                args.params
            );
            resolve(response.block);
        } else if (args.method === 'eth_getTransactionReceipt') {
            const response = await provider.rpcStream(
                'getTransactionReceipt',
                args.params
            );
            resolve(response.receipt);
        } else if (args.method === 'wallet_watchAsset') {
            //TODO
        } else if (args.method === 'eth_getEncryptionPublicKey') {
            let resp = await provider.rpcStream('getEncryptionKey', {});
            debug.log('key', resp);
            resolve(resp.key);
        } else if (args.method === 'eth_decrypt') {
            let resp = await provider.rpcStream('decrypt', args.params);
            resolve(resp.message);
        } else if (args.method === 'eth_call') {
            const response = await provider.rpcStream('ethCall', args.params);
            resolve(response.ethCall);
        }
    });
}
