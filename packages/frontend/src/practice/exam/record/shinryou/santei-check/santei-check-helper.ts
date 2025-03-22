import api from "@/lib/api";
import type { Shinryou, Visit, VisitEx } from "myclinic-model";
import { DateWrapper } from "myclinic-util";

export async function listShinryouOfRecentMonths(visit: VisitEx, nMonths: number): Promise<Shinryou[]> {
	let visits = await collectRecentVisits(visit, nMonths);
	return await listShinryouForVisits(visits);
}

async function collectRecentVisits(visit: VisitEx, nMonths: number): Promise<Visit[]> {
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
				.incMonth(-(nMonths - 1))
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

export function shinryouListIncludes(
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
