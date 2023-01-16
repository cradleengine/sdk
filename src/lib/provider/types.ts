// @ts-nocheck
export enum TransactionTypes {
  EXECUTION_TRANSACTION,
  DEPLOYMENT_TRANSACTION,
  REG_TRANSACTION,
}

export interface ProviderState {
  accounts: null | string[];
  isConnected: boolean;
  isUnlocked: boolean;
  initialized: boolean;
  isPermanentlyDisconnected: boolean;
}

export interface RequestArguments {
  isSui: boolean;
  /** The RPC method to request. */
  method: string;
  /** The params of the RPC method, if any. */
  params?: unknown[] | Record<string, unknown> | TransactionParams[];
}

export interface TransactionParams {
  from: string;
  to: string;
  gas?: string;
  gasPrice?: string;
  value: string;
  data?: string;
  chain_id?: string;
}

export interface ValidateTransactionParams {
  PARAMS: TransactionParams;
  TRANSACTION_TYPE: TransactionTypes;
  TXN_DETAILS?: object;
}

export interface ChainIdParams {
  chainId: string;
}

export interface ProviderMessage {
  type: string;
  data: unknown;
}

export interface JsonRpcRequest {
  id: string | undefined;
  jsonrpc: '2.0';
  method: string;
  params?: Array<any>;
}

export const CHAIN_NOT_SUPPORTED_ERROR = '!405';

export const supportedChainIds = [
  '0x1',
  '0x4',
  '0x38',
  '0x89',
  // "0x64",
  '0xa869',
  '0xa86a',
  '0x13881',
];
