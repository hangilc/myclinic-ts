import type { RezeptComment, Shinryou, ShinryouEx, VisitEx } from "myclinic-model";
import { checkForRcpt, type CheckError, type Fixer } from "../check";
import { ShinryouMemoWrapper } from "@/lib/shinryou-memo";
import { toHankaku } from "@/lib/zenkaku";
import api from "@/lib/api";


// 血糖自己測定器加算（６０回以上）（１型糖尿病の患者等を除く）
// shinryoucode = 114007410 を算定した場合には、
// 診療行為に対してコメントをくわえなければならない。
const commentCode = 842100048;

export async function checkGlucoseSelfMeasuring(visit: VisitEx):
	Promise<CheckError | undefined> {
	for (let shinryou of visit.shinryouList) {
		if (shinryou.shinryoucode === 114007410) {
			console.log("glucose measurement");
			let memo = new ShinryouMemoWrapper(shinryou.memo);
			let comments = memo.getComments();
			let com = findComment(comments);
			console.log("com", com);
			if (com) {
				return checkComment(com);
			} else {
				return checkNullComment(shinryou.asShinryou());
			}
		}
	}
	return undefined;
}

export const testExports = {
	checkComment,
};

function createFixComment(): RezeptComment {
	return {
		code: commentCode,
		text: "６０",
	}
}

function nullCommentFix(
	shinryou: Shinryou,
	updateShinryou: (shinryou: Shinryou) => Promise<any>
): { fix: Fixer; hint: string } {
	const fix = async () => {
		const memoWrapper = new ShinryouMemoWrapper(shinryou.memo);
		let comms = [...memoWrapper.getComments()];
		comms.push(createFixComment());
		memoWrapper.setComments(comms);
		let newShinryou = Object.assign({}, shinryou, { memo: memoWrapper.memo });
		await updateShinryou(newShinryou);
		return true;
	};
	return {
		fix,
		hint: "コメントを追加します"
	}
}

function checkNullComment(shinryou: Shinryou): CheckError {
	return {
		code: "血糖自己測定器加算（６０回以上）: 該当コメントがありません。",
		...nullCommentFix(shinryou, api.updateShinryou)
	};
}

function checkComment(comment: RezeptComment): CheckError | undefined {
	let text = comment.text;
	if (text == undefined) {
		return { code: "血糖自己測定器加算（６０回以上）: 該当コメントが不適切です（no text）。" };
	}
	text = toHankaku(text);
	if (/^\d+$/.test(text)) {
		let days = parseInt(text);
		if (days >= 60) {
			return undefined;
		} else {
			return { code: "該当コメントが不適切です（less then 60）。" };
		}
	} else {
		return { code: "該当コメントが不適切です（not integer）。" };
	}

}

function findComment(comments: RezeptComment[]): RezeptComment | undefined {
	for (let c of comments) {
		if (c.code === commentCode) {
			return c;
		}
	}
	return undefined;
}

function getCommentValue(comment: RezeptComment): number | undefined {
	let text = comment.text;
	text = toHankaku(text);
	if (/^\d+$/.test(text)) {
		return parseInt(text);
	} else {
		return undefined;
	}
}
