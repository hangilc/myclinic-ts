import type { RezeptComment } from "myclinic-model";
import { 診療識別コードvalues } from "myclinic-rezept/codes";
import { jsonToMemo, memoToJson } from "@/lib/memo";
import { asDefined, asNotEmptyStr, asObject, asPositiveInt, asTypedArray, asUndefined, combineErrors, error, ok, orVerifier, verified, Verifier } from "./verify";

export const rezeptCommentVerifier = verifierOfRezeptComment();
const memoToJsonVerifier = memoToJson();

export class ShinryouMemoWrapper {
  memo: string | undefined;

  constructor(memo: string | undefined) {
	this.memo = memo ?? "";
  }

  static from(memo: string | undefined): ShinryouMemoWrapper {
    return new ShinryouMemoWrapper(memo);
  }

  getComments(): RezeptComment[] {
	let ver = memoToJsonVerifier
	  .map(obj => obj.comments ?? [])
	  .chain(asTypedArray(rezeptCommentVerifier));
	return verified(ver.verify(this.memo));
  }

  setComments(comments: RezeptComment[]) {
	let json = verified(memoToJsonVerifier.verify(this.memo));
	if (comments.length === 0) {
	  delete json.comments;
	} else {
	  json = Object.assign({}, json, { comments });
	}
	this.memo = jsonToMemo(json);
  }

}

// RezeptComment code text shikibetsucode
function verifierOfRezeptComment(): Verifier<any, RezeptComment> {
  return new Verifier<any, RezeptComment>(src => {
	let v = asDefined().chain(asObject());
	let r = v.verify(src);
	if (r.ok) {
	  let obj = r.value;
	  let codeVerifier = asPositiveInt();
	  let textVerifier = asNotEmptyStr();
	  let shikibetsucodeVerifier: Verifier<any, undefined | string> = orVerifier([
		asUndefined(),
		asNotEmptyStr().chain(new Verifier(src => {
		  let codes = 診療識別コードvalues;
		  if (codes.includes(src)) {
			return ok(src);
		  } else {
			return error("正しい診療識別コードでありません");
		  }
		}))],
		"正しい診療識別コードでありません"
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



