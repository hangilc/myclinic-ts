import api from "@/lib/api";
import { kouhiRep } from "@/lib/hoken-rep";

export async function listKouhi(year: number, month: number) {
  const visits = (await api.listVisitByMonth(year, month)).filter(visit =>
    visit.kouhi1Id > 0 || visit.kouhi2Id > 0 || visit.kouhi3Id > 0
  );
  return await Promise.all(visits.map(async visit => {
    const patient = await api.getPatient(visit.patientId);
    const kouhiList = [visit.kouhi1Id, visit.kouhi2Id, visit.kouhi3Id].filter(kouhiId => kouhiId > 0)
      .map(async kouhiId => {
        const kouhi = await api.getKouhi(kouhiId);
        return kouhiRep(kouhi.futansha, kouhi.memoAsJson);
      })
    return {
      patient,
      kouhiList: await Promise.all(kouhiList),
    }
  }));
}