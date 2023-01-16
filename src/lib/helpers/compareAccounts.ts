export function compareAccounts(accounts1: any, accounts2: any): boolean {
	if (!accounts1 || accounts1 === null || !accounts2 || accounts2 === null) {
		return false;
	}
	if (typeof accounts1 !== typeof accounts2) {
		return false;
	} else if (typeof accounts1 === 'object' && typeof accounts2 === 'object') {
		return (
			accounts1.length === accounts2.length &&
			accounts1.every(function (value: any, index: any) {
				return value === accounts2[index];
			})
		);
	}
	return accounts1 === accounts2;
}
