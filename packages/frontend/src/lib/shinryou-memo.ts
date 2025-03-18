import type { RezeptComment } from "myclinic-model";
import { 診療識別コードvalues } from "myclinic-rezept/codes";
import { jsonToMemo, memoToJson } from "@/lib/memo";

export class ShinryouMemoWrapper {
	memo: string | undefined;

	constructor(memo: string | undefined) {
		this.memo = memo ?? "";
	}

	asJson(): any {
		return memoToJson(this.memo);
	}

	getComments(): RezeptComment[] {
		let json = this.asJson();
		let comments = json.comments ?? [];
		if (!Array.isArray(comments)) {
			throw new Error("Invalid shinryou-memo comments type");
		}
		const result: RezeptComment[] = [];
		for (let c of comments) {
			const rc = validateComment(c);
			if (typeof rc === "string") {
				throw new Error(rc);
			}
			result.push(rc);
		}
		return result;
	}

	setComments(comments: RezeptComment[]) {
		let json = this.asJson();
		if (comments.length === 0) {
			delete json.comments;
		} else {
			json = Object.assign({}, json, { comments });
		}
		this.memo = jsonToMemo(json);
	}
}

function validateComment(arg: any): RezeptComment | string {
	let code = arg.code;
	if (!code) {
		return "'code' not found";
	}
	if (typeof code !== "number") {
		return "'code' is not number";
	}
	let text = arg.text;
	if (text == null) {
		return "'text' not found";
	}
	if (typeof text !== "string") {
		return "'text is not string";
	}
	let shikibetsucode = arg.shikibetsucode;
	if (shikibetsucode == null) {
		shikibetsucode = undefined;
	} else {
		if (typeof shikibetsucode !== "string") {
			return "'shikibetsucode' is not string";
		}
		let codes = 診療識別コードvalues;
		if (!codes.includes(shikibetsucode)) {
			return `invalid 'shikibetsucode': ${shikibetsucode}`;
		}
	}
	return { code, text, shikibetsucode };
}

type VerifyResult<T> = {
	ok: true;
	value: T
} | {
	ok: false;
	message: string;
	otherMessages: string[];
}

class Verifier<S, T> {
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

// RezeptComment code text shikibetsucode
function verifierOfRezeptComment(): Verifier<any, RezeptComment> {
	return new Verifier<any, RezeptComment>(src => {
		let v = asDefined().chain(asObject());
		let r = v.verify(src);
		if (r.ok) {
			let obj = r.value;
			let codeVerifier = asDefined()
				.chain(asNumber())
				.chain(asInt());
			let textVerifier = asDefined().chain(asStr()).chain(asNotEmptyStr());
			let shikibetsucodeVerifier: Verifier<any, undefined | string> = orVerifier(
				asUndefined(),
				asDefined().chain(asStr()).chain(asNotEmptyStr()).chain(new Verifier(src => {
					let codes = 診療識別コードvalues;
					if( codes.includes(src) ){
						return ok(src);
					} else {
						return error("正しい診療識別コードでありません");
					}
				}))
			);
			let codeResult = codeVerifier.verify(obj["code"], "code");
			let textResult = textVerifier.verify(obj["text"], "text");
			let shikibetsucodeResult = shikibetsucodeVerifier.verify(obj["shikibetsucode"], "shikibetsucode");
			if (codeResult.ok && textResult.ok && shikibetsucodeResult.ok) {
				return ok({ "code": codeResult.value, "text": textResult.value, "shikibetsucode": shikibetsucodeResult.value, });
			} else {
				let ms = combineErrors(codeResult, textResult, shikibetsucodeResult);
				return { ok: false, ...ms };
			}
		} else {
			return r;
		}
	})
}

export const rezeptCommentVerifier = verifierOfRezeptComment;

function ok<T>(value: T): VerifyResult<T> {
	return { ok: true, value };
}

function error<T>(message: string, otherMessages: string[] = []): VerifyResult<T> {
	return { ok: false, message, otherMessages };
}

function asDefined(): Verifier<any, any> {
	return new Verifier((src: any) => {
		if (src != undefined) {
			return ok(src);
		} else {
			return error("値がありません");
		}
	});
}

function asNumber(): Verifier<any, number> {
	return new Verifier((src: any) => {
		if (typeof src === "number") {
			return ok(src);
		} else {
			return error("数値でありません");
		}
	});
}

function asInt(): Verifier<any, number> {
	return new Verifier((src: any) => {
		if (Number.isSafeInteger(src)) {
			return ok(src);
		} else {
			return error("整数でありません");
		}
	});
}

function asPositive(): Verifier<number, number> {
	return new Verifier((src: number) => {
		if (src > 0) {
			return ok(src);
		} else {
			return error("正の数値でありません");
		}
	});
}

function asStr(): Verifier<any, string> {
	return new Verifier((src: any) => {
		if (typeof src === "string") {
			return ok(src);
		} else {
			return error("文字列でありません");
		}
	});
}

function asNotEmptyStr(): Verifier<string, string> {
	return new Verifier((src: string) => {
		if (src !== "") {
			return ok(src);
		} else {
			return error("空白の文字列です");
		}
	});
}

function asObject(): Verifier<any, any> {
	return new Verifier((src: any) => {
		if (typeof src === "object") {
			return ok(src);
		} else {
			return error("Object 型でありません");
		}
	});
}

function asUndefined(): Verifier<any, undefined> {
	return new Verifier(src => {
		if( src === undefined ){
			return ok(src);
		} else {
			error("undefined でありません");
		}
	});
}

function orVerifier<S, T>(...verifiers: Verifier<S, T>[]): Verifier<S, T> {
	return new Verifier<S, T>((src: any) => {
		let errs: string[] = [];
		for(let ver of verifiers){
			let r = ver.verify(src);
			if( r.ok ){
				return r;
			} else {
				errs.push(r.message);
			}
		}
		return error(errs.join(","));
	});
}

function combineErrors(...errs: VerifyResult<any>[]): { message: string; otherMessages: string[] } {
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
