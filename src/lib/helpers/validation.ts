import {
  ChainIdParams,
  supportedChainIds,
  TransactionParams,
  ValidateTransactionParams,
} from '../provider/types';

export function isTransaction(arg: any): arg is readonly TransactionParams[] {
  return (
    arg[0] &&
    arg[0].from &&
    typeof arg[0].from === 'string' &&
    arg[0].to &&
    typeof arg[0].to === 'string'
  );
}

export function isChainId(arg: any): arg is readonly ChainIdParams[] {
  return (
    arg[0] &&
    arg[0].chainId &&
    typeof arg[0].chainId === 'string' &&
    supportedChainIds.includes(arg[0].chainId)
  );
}

export function isValidationTransaction(
  arg: any
): arg is ValidateTransactionParams {
  console.log;
  return arg.PARAMS && arg.TRANSACTION_TYPE;
}
