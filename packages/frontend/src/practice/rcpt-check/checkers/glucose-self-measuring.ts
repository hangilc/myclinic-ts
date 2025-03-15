import type { RezeptComment, ShinryouEx, VisitEx } from "myclinic-model";
import type { CheckError } from "../check";
import { ShinryouMemoWrapper } from "@/lib/shinryou-memo";
import { toHankaku } from "@/lib/zenkaku";


// 血糖自己測定器加算（６０回以上）（１型糖尿病の患者等を除く）
// shinryoucode = 114007410 を算定した場合には、
// 診療行為に対してコメントをくわえなければならない。
export async function checkGlucoseSelfMeasuring(visit: VisitEx):
	Promise<CheckError | undefined> {
	const slist: ShinryouEx[] = [];
	visit.shinryouList.forEach(shinryou => {
		if (shinryou.shinryoucode === 114007410) {
			let memo = new ShinryouMemoWrapper(shinryou.memo);
			let comments = memo.getComments();
			let com = findComment(comments);
			if( com ){
				let value = getCommentValue(com);
				if( value !== undefined && value >= 60 ){
					return undefined;
				} else {
					return { code: "該当コメントが不適切です。" };
				}
			} else {

			}
			console.log("found", comments);
		}
	});
	return undefined;
	}

export function checkForShinryoucode114007410(comment: RezeptComment): CheckError | undefined {
	let text = comment.text;
	if( text == undefined ){
		return { code: "該当コメントが不適切です（no text）。" };
	}
	text = toHankaku(text);
	if( /^\d+$/.test(text) ){
		let days = parseInt(text);
		if( days >= 60 ){
			return undefined;
		} else {
			return { code: "該当コメントが不適切です（less then 60）。" };
		}
	} else {
		return { code: "該当コメントが不適切です（not integer）。" };
	}
	
}

function findComment(comments: RezeptComment[]): RezeptComment | undefined {
	for(let c of comments) {
		if( c.code === 842100048 ){
			return c;
		}
	}
	return undefined;
}

function getCommentValue(comment: RezeptComment): number | undefined {
	let text = comment.text;
	text = toHankaku(text);
	if( /^\d+$/.test(text) ){
		return parseInt(text);
	} else {
		return undefined;
	}
}
