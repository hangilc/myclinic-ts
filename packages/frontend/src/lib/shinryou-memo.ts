import type { RezeptComment } from "myclinic-model";
import { 診療識別コード, 診療識別コードvalues } from "myclinic-rezept/codes";

export class ShinryouMemoWrapper {
	memo: string;

	constructor(memo: string | undefined) {
		this.memo = memo ?? "";
	}

	getJson(): any {
		if( this.memo === "" ){
			return {};
		} else {
			return JSON.parse(this.memo);
		}
	}

	getComments(): RezeptComment[] {
		let json = this.getJson();
		let comments = json.comments ?? [];
		if( !Array.isArray(comments) ){
			throw new Error("Invalid shinryou-memo comments type");
		}
		const result: RezeptComment[] = [];
		for(let c of comments){
			const rc = validateComment(c);
			if( typeof rc === "string" ){
				throw new Error(rc);
			}
			result.push(rc);
		}
		return result;
	}
}

function validateComment(arg: any): RezeptComment | string{
	let code = arg.code;
	if( !code ){
		return "'code' not found";
	}
	if( typeof code !== "number" ){
		return "'code' is not number";
	}
	let text = arg.text;
	if( text == null ){
		return "'text' not found";
	}
	if( typeof text !== "string" ){
		return "'text is not string";
	}
	let shikibetsucode = arg.shikibetsucode;
	if( shikibetsucode == null ){
		shikibetsucode = undefined;
	} else {
		if( typeof shikibetsucode !== "string" ){
			return "'shikibetsucode' is not string";
		}
		let codes = 診療識別コードvalues;
		if( !codes.includes(shikibetsucode) ){
			return `invalid 'shikibetsucode': ${shikibetsucode}`;
		}
	}
	return { code, text, shikibetsucode };
}
