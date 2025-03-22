import api from "@/lib/api";
import type { Shinryou, Visit, VisitEx } from "myclinic-model";
import { DateWrapper } from "myclinic-util";
import type { ShinryouCheckProc } from "./record-shinryou-types";
import { listShinryouOfRecentMonths, shinryouListIncludes } from "./santei-check-helper";

const code医療情報取得加算初診 = 111703270; // 医療情報取得加算（初診）
const name医療情報取得加算初診 = "医療情報取得加算（初診）";
const code医療情報取得加算再診 = 112708970; // 医療情報取得加算（再診）
const name医療情報取得加算再診 = "医療情報取得加算（再診）";

export async function adaptToShoshinForIryouJouhou(visit: VisitEx, checked: boolean):
	Promise<ShinryouCheckProc[]> {
	if (checked) {
		let shinryouList = await listShinryouOfRecentMonths(visit, 1);
		if (!shinryouListIncludes(shinryouList, code医療情報取得加算初診)) {
			return [{ name: name医療情報取得加算初診, check: true }];
		} else {
			return [];
		}
	} else {
		return [{ name: name医療情報取得加算初診, check: false }];
	}
}

export async function adaptToSaishinForIryouJouhou(visit: VisitEx, checked: boolean):
	Promise<ShinryouCheckProc[]> {
	if (checked) {
		let shinryouList = await listShinryouOfRecentMonths(visit, 3);
		if (!shinryouListIncludes(shinryouList, code医療情報取得加算再診)) {
			return [{ name: name医療情報取得加算再診, check: true }];
		} else {
			return [{ name: name医療情報取得加算再診, check: false }];
		}
	} else {
		return [{ name: name医療情報取得加算再診, check: false }];
	}
}



// async function probeIryouJouhouShutokuSaishin() {
// 	let visits: Visit[] = await api.listVisitByPatientReverse(
// 		visit.patient.patientId,
// 		0,
// 		20,
// 	);
// 	let ym = DateWrapper.fromSqlDatetime(visit.asVisit.visitedAt)
// 		.getFirstDayOfSameMonth()
// 		.incMonth(-2)
// 		.asSqlDate()
// 		.substring(0, 7);
// 	visits = visits.filter(
// 		(v) =>
// 			v.visitId !== visit.visitId &&
// 			(v.shahokokuhoId > 0 || v.koukikoureiId > 0) &&
// 			v.visitedAt.substring(0, 7) >= ym,
// 	);
// 	let result: Shinryou[] = (
// 		await Promise.all(
// 			visits.map((visit) => api.listShinryouForVisit(visit.visitId)),
// 		)
// 	).flat();
// 	let prevFound = result.some((s) => s.shinryoucode === 112708970);
// 	console.log("prevFound", prevFound);
// }

// async function probeIryouJouhouShutoku() {
// 	switch (checkShoshinSaishin(visit.shinryouList)) {
// 		case "shoshin": {
// 			await probeIryouJouhouShutokuShoshin();
// 			return;
// 		}
// 		case "saishin": {
// 			await probeIryouJouhouShutokuSaishin();
// 			return;
// 		}
// 		default: {
// 			// nop
// 		}
// 	}
// }
