import { asJson, ok, Verifier } from "./verify";

export function memoToJson(): Verifier<any, any> {
	return new Verifier((src: any) => {
		if (src == undefined) {
			return ok({});
		} else if( typeof src === "string" && src.trim() === "" ){
			return ok({});
		} else {
			return asJson().verify(src);
		}
	});
}

export function jsonToMemo(json: any): string | undefined {
	if (typeof (json) === "object" && Object.keys(json).length === 0) {
		return undefined;
	} else {
		return JSON.stringify(json);
	}
}
