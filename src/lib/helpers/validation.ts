import type {
	TransactionParams,
	ChainIdParams,
	ValidateTransactionParams,
} from '../provider/types';
import { supportedChainIds } from '../provider/types';

export function isTransaction(arg: any): arg is TransactionParams[] {
	return (
		arg[0] &&
		arg[0].from &&
		typeof arg[0].from === 'string' &&
		arg[0].to &&
		typeof arg[0].to === 'string'
	);
}

export function isChainId(arg: any): arg is ChainIdParams[] {
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
