import api from "@/lib/api";
import type { Shinryou, Visit, VisitEx } from "myclinic-model";
import { DateWrapper } from "myclinic-util";
import type { ShinryouCheckProc } from "./record-shinryou-types";

const code医療情報取得加算初診 = 111703270; // 医療情報取得加算（初診）
const code医療情報取得加算再診 = 112708970; // 医療情報取得加算（再診）：112708970

export async function adaptToShoshinForIryouJouhou(visit: VisitEx, checked: boolean):
	Promise<ShinryouCheckProc[]> {
	if (checked) {
		let visits = await collectPrevVisits(visit, 1);
		let shinryouList = await listShinryouForVisits(visits);
		if (!shinryouListIncludes(shinryouList, code医療情報取得加算初診)) {
			return [{ name: "医療情報取得加算（初診）", check: true }];
		} else {
			return [];
		}
	} else {
		return [{ name: "医療情報取得加算（初診）", check: false }];
	}
}

async function probeIryouJouhouShutokuSaishin(visit: VisitEx):
	Promise<"医療情報取得加算（再診）" | undefined> {
	return undefined;
}

async function collectPrevVisits(visit: VisitEx, nMonths: number): Promise<Visit[]> {
	let prevVisits: Visit[] = await api.listVisitByPatientReverse(
		visit.patient.patientId,
		0,
		20,
	);
	let result: Visit[] = [];
	for (let v of prevVisits) {
		if (v.visitedAt > visit.visitedAt) {
			// ignore newer visits
			continue;
		} else if (v.visitId === visit.visitId) {
			// ignore current visit
			continue;
		} else {
			let curYm = visit.visitedAt.substring(0, 7);
			let ym = DateWrapper.fromSqlDatetime(visit.asVisit.visitedAt)
				.getFirstDayOfSameMonth()
				.incMonth(-2)
				.asSqlDate()
				.substring(0, 7);
			let at = v.visitedAt.substring(0, 7);
			if (at >= ym && at <= curYm) {
				result.push(v);
			} else {
				break;
			}
		}
	}
	return result;
}

async function listShinryouForVisits(visits: Visit[]): Promise<Shinryou[]> {
	return (
		await Promise.all(visits.map(visit => api.listShinryouForVisit(visit.visitId)))
	).flat();
}

function shinryouListIncludes(
	list: Shinryou[],
	shinryoucode: number,
): boolean {
	for (let s of list) {
		if (s.shinryoucode === shinryoucode) {
			return true;
		}
	}
	return false;
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
