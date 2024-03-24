import api from "@/lib/api";
import { probeFaxToPharmacyText } from "@/lib/shohousen-text-helper";
import type { Patient } from "myclinic-model";

export function defaultDates(today: Date): [Date, Date] {
  const d = today.getDate();
  if( d >= 1 && d <= 15 ){
    const fromDate = new Date(today);
    fromDate.setDate(1);
    fromDate.setMonth(fromDate.getMonth() - 1);
    fromDate.setDate(15);
    const uptoDate = new Date(today);
    uptoDate.setDate(0);
    return [fromDate, uptoDate];
  } else {
    const fromDate = new Date(today);
    fromDate.setDate(1);
    const uptoDate = new Date(today);
    uptoDate.setDate(15);
    return [fromDate, uptoDate];
  }
}

export interface FaxShohousen {
  patient: Patient,
  pharma: string,
}

export async function probeFaxShohousen(visitId: number): Promise<FaxShohousen | undefined> {
  const texts = await api.listTextForVisit(visitId);
  for(let text of texts){
    const p = probeFaxToPharmacyText(text.content);
    if( p !== undefined ){
      const visit = await api.getVisit(visitId);
      const patient = await api.getPatient(visit.patientId);
      return { patient, pharma: p };
    }
  }
  return undefined;
}
