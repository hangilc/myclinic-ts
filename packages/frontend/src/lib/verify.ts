export type VerifyResult<T> = {
	ok: true;
	value: T
} | {
	ok: false;
	message: string;
	otherMessages: string[];
}

export function ok<T>(value: T): VerifyResult<T> {
	return { ok: true, value };
}

export function error<T>(message: string, otherMessages: string[] = []): VerifyResult<T> {
	return { ok: false, message, otherMessages };
}

export function verified<T>(r: VerifyResult<T>): T {
	if (r.ok) {
		return r.value;
	} else {
		throw new Error(r.message);
	}
}

export class Verifier<S, T> {
	f: (src: S) => VerifyResult<T>;

	constructor(f: (src: S) => VerifyResult<T>) {
		this.f = f;
	}

	verify(src: S, errorPrefix?: string): VerifyResult<T> {
		const r = this.f(src);
		if (!r.ok && errorPrefix !== undefined) {
			return {
				ok: false,
				message: errorPrefix + ":" + r.message,
				otherMessages: r.otherMessages.map(m => errorPrefix + ":" + m),
			}
		} else {
			return r;
		}
	}

	chain<U>(next: Verifier<T, U>): Verifier<S, U> {
		const self = this;
		return new Verifier<S, U>(
			(src: S) => {
				const r = self.verify(src);
				if (r.ok) {
					return next.verify(r.value);
				} else {
					return r;
				}
			}
		);
	}

	map<U>(f: (t: T) => U): Verifier<S, U> {
		const self = this;
		return new Verifier<S, U>(
			(src: S) => {
				const r = self.verify(src);
				if (r.ok) {
					return ok(f(r.value));
				} else {
					return r;
				}
			}
		);
	}
}

export function asDefined(): Verifier<any, any> {
	return new Verifier((src: any) => {
		if (src != undefined) {
			return ok(src);
		} else {
			return error("値がありません");
		}
	});
}

export function definedAsNumber(): Verifier<any, number> {
	return new Verifier((src: any) => {
		if (typeof src === "number") {
			return ok(src);
		} else {
			return error("数値でありません");
		}
	});
}

export function asNumber(): Verifier<any, number> {
	return asDefined().chain(definedAsNumber());
}

export function numberAsInt(): Verifier<number, number> {
	return new Verifier((src: number) => {
		if (Number.isSafeInteger(src)) {
			return ok(src);
		} else {
			return error("整数でありません");
		}
	});
}

export function numberAsPositive(): Verifier<number, number> {
	return new Verifier((src: number) => {
		if (src > 0) {
			return ok(src);
		} else {
			return error("正の数値でありません");
		}
	});
}

export function asInt(): Verifier<any, number> {
	return asNumber().chain(numberAsInt());
}

export function asPositiveInt(): Verifier<any, number> {
	return asInt().chain(numberAsPositive());
}

export function definedAsStr(): Verifier<any, string> {
	return new Verifier((src: any) => {
		if (typeof src === "string") {
			return ok(src);
		} else {
			return error("文字列でありません");
		}
	});
}

export function asStr(): Verifier<any, string> {
	return asDefined().chain(definedAsStr());
}

export function stringAsNotEmpty(): Verifier<string, string> {
	return new Verifier((src: string) => {
		if (src !== "") {
			return ok(src);
		} else {
			return error("空白の文字列です");
		}
	});
}

export function asNotEmptyStr(): Verifier<any, string> {
	return asStr().chain(stringAsNotEmpty());
}

export function asObject(): Verifier<any, any> {
	return new Verifier((src: any) => {
		if (typeof src === "object") {
			return ok(src);
		} else {
			return error("Object 型でありません");
		}
	});
}
 
export function asUndefined(): Verifier<any, undefined> {
	return new Verifier((src: any) => {
		if (src === undefined) {
			return ok(src);
		} else {
			return error("undefined でありません");
		}
	});
}

export function strAsJson(): Verifier<string, any> {
	return new Verifier((src: string) => {
		try {
			return ok(JSON.parse(src));
		} catch {
			return error("JSON 形式のもち列でありません");
		}
	});
}

export function asJson(): Verifier<any, any> {
	return asNotEmptyStr().chain(strAsJson());
}

export function asArray(): Verifier<any, any[]> {
	return new Verifier((src: any) => {
		if (Array.isArray(src)) {
			return ok(src);
		} else {
			return error("Array 型でありません");
		}
	});
}

export function arrayAsTyped<T>(v: Verifier<any, T>): Verifier<any[], T[]> {
	return new Verifier((src: any[]) => {
		const ar: T[] = [];
		for (let e of src) {
			const r = v.verify(e);
			if (r.ok) {
				ar.push(r.value);
			} else {
				return r;
			}
		}
		return ok(ar);
	});
}

export function asTypedArray<T>(v: Verifier<any, T>): Verifier<any, T[]> {
	return asArray().chain(arrayAsTyped(v));
}

export function orVerifier<S, T>(
	verifiers: Verifier<S, T>[], errorMessage?: string
): Verifier<S, T> {
	return new Verifier<S, T>((src: any) => {
		let errs: string[] = [];
		for (let ver of verifiers) {
			let r = ver.verify(src);
			if (r.ok) {
				return r;
			} else {
				errs.push(r.message);
			}
		}
		if (errorMessage === undefined) {
			errorMessage = errs.join(",");
		}
		return error(errorMessage);
	});
}

export function combineErrors(
	...errs: VerifyResult<any>[]
): { message: string; otherMessages: string[] } {
	const ms: string[] = [];
	for (let err of errs) {
		if (!err.ok) {
			ms.push(err.message);
			ms.push(...err.otherMessages);
		}
	}
	let message = ms.shift();
	if (message === undefined) {
		throw new Error("no error found");
	}
	return { message, otherMessages: ms };
}
