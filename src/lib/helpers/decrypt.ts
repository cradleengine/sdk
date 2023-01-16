import { Buffer } from 'buffer';
import { stripHexPrefix } from 'ethereumjs-util';

export function decrypt(msg: string): string {
	const stripped = stripHexPrefix(msg);
	const buff = Buffer.from(stripped, 'hex');
	if (buff.toString('utf8')) {
		return buff.toString('utf8');
	} else {
		return stripped;
	}
}
