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

export function rezeptCommentVerifier(): Verifier<any, RezeptComment> {
	let v = asDefined()
		.chain(asObject())
		.map((src: any) => ({ src, props: {} }))
		.chain(propVerifier2<RezeptComment>("code", asDefined().chain(asNumber()).chain(asInt())))
		.chain(propVerifier2<RezeptComment>("text", asDefined().chain(asStr()).chain(asNotEmptyStr())))
		.map(arg => arg.props);
	return v;

	// let code = arg.code;
	// if (!code) {
	// 	return error("'code' 属性がみつかりません");
	// }
	// if (typeof code !== "number") {
	// 	return error("'code' 属性が数値でありません");
	// }
	// let text = arg.text;
	// if (text == null) {
	// 	return error("'text' 属性がみつかりません");
	// }
	// if (typeof text !== "string") {
	// 	return error("'text' 属性が文字列でありません");
	// }
	// let shikibetsucode = arg.shikibetsucode;
	// if (shikibetsucode == null) {
	// 	shikibetsucode = undefined;
	// } else {
	// 	if (typeof shikibetsucode !== "string") {
	// 		return "'shikibetsucode' is not string";
	// 	}
	// 	let codes = 診療識別コードvalues;
	// 	if (!codes.includes(shikibetsucode)) {
	// 		return `invalid 'shikibetsucode': ${shikibetsucode}`;
	// 	}
	// }
	// return ok({ code, text, shikibetsucode });
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

	verify(src: S): VerifyResult<T> {
		return this.f(src);
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

	beginObject<O>(): Verifier<any, ObjectVerifier<O, {}>> {
		const self = this;
		return new Verifier(
			(src) => {
				const r = self.verify(src);
				if (r.ok) {
					return ok(new ObjectVerifier(r.value, {}, []));
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

class ObjectVerifier<O, P extends Partial<O>> {
	src: any;
	props: P;
	errors: string[];

	constructor(src: any, props: P, errors: string[]) {
		this.src = src;
		this.props = props;
		this.errors = errors;
	}

	prop(name: Extract<keyof O, string>, propVerifier: Verifier<any, O[typeof name]>, repName: string = name.toString()) {
		const r = propVerifier.verify(this.src);
		if (r.ok) {
			let newProps = Object.assign({}, this.props, { [name]: r.value });
			return new ObjectVerifier(this.src, newProps, this.errors);
		} else {
			let msgs = [r.message, ...r.otherMessages];
			msgs = msgs.map(m => repName + ":" + m);
			return new ObjectVerifier(this.src, this.props, msgs);
		}
	}
}

function ok<T>(value: T): VerifyResult<T> {
	return { ok: true, value };
}

function error<T>(message: string, otherMessages: string[] = []): VerifyResult<T> {
	return { ok: false, message, otherMessages };
}

function addErrorPrefix(err: { ok: false; message: string; otherMessages: string[] }, prefix: string | undefined): {
	ok: false; message: string; otherMessages: string[]
} {
	if (prefix == undefined) {
		return err;
	} else {
		let message = prefix + ":" + err.message;
		let otherMessages = err.otherMessages.map(m => prefix + ":" + m);
		return { ok: false, message, otherMessages };
	}
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

function propVerifier<P, T, TT>(name: string, verifier: Verifier<any, T>, assigner: (t: T) => TT, prefixName: string = name):
	Verifier<{ src: any, props: P }, { src: any; props: P & TT }> {
	return new Verifier((arg: { src: any; props: P }) => {
		let prop: any = arg.src[name];
		let t: VerifyResult<T> = verifier.verify(prop);
		if (t.ok) {
			let newProps: P & TT = Object.assign({}, arg.props, assigner(t.value));
			return ok({ src: arg.src, props: newProps });
		} else {
			return addErrorPrefix(t, prefixName);
		}
	});
}

function propVerifier2<O>(name: Extract<keyof O, string>, verifier: Verifier<any, O[typeof name]>, prefixName: string = name):
	Verifier<{ src: any, props: Partial<O> }, { src: any; props: Partial<O> }> {
	return new Verifier((arg: { src: any; props: Partial<O> }) => {
		let prop: any = arg.src[name];
		let t = verifier.verify(prop);
		if (t.ok) {
			let newProps = Object.assign({}, arg.props, { [name]: t.value });
			return ok({ src: arg.src, props: newProps });
		} else {
			return addErrorPrefix(t, prefixName);
		}
	});
}

function verified<T>(r: VerifyResult<T>): T {
	if (r.ok) {
		return r.value;
	} else {
		throw new Error(r.message);
	}
}

