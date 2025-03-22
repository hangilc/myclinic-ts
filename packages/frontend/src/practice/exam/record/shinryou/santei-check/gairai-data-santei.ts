import type { VisitEx } from "myclinic-model";
import { listShinryouOfRecentMonths, shinryouListIncludes } from "./santei-check-helper";
import type { ShinryouCheckProc } from "./record-shinryou-types";

const gairaiDataName = "外来データ提出加算（生活習慣病管理料１・２）";
const gairaiDataCode = 113042070;

export async function adaptToSeikatsuShuukanForGairaiDataTeishutsu(
	visit: VisitEx,
	checked: boolean,
): Promise<ShinryouCheckProc[]> {
	if( checked ){
		let shinryouList = await listShinryouOfRecentMonths(visit, 1);
		console.log("shinryouList", shinryouList);
		if( !shinryouListIncludes(shinryouList, gairaiDataCode) ){
			return [{ name: gairaiDataName, check: true }]
		} else {
			return [{ name: gairaiDataName, check: false }]
		}
	} else {
		return [{ name: gairaiDataName, check: false }];
	}
}
