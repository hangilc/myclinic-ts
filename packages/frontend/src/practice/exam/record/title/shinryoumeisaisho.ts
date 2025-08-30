import type { Kubun, ShinryoumeisaishoData } from "@/lib/drawer/forms/shinryoumeisaisho/shinryoumeisaisho-data";
import { groupMeisaiItemsBySection, visitToMeisaiItems } from "@/lib/rezept-meisai";
import type { ClinicInfo, VisitEx } from "myclinic-model";

export function createShinryoumeisaishoData(visit: VisitEx, clinicInfo: ClinicInfo): ShinryoumeisaishoData {
  const at = visit.visitedAt.substring(0, 10);
  const items = visitToMeisaiItems(visit, at);
  const meisai = groupMeisaiItemsBySection(items);
  const patient = visit.patient;
  const kubunList: Kubun[] = [];
  meisai.forEach(([sec, items]) => {
    if (items.length > 0) {
      items.forEach((item, index) => {
        let kubunName = index === 0 ? sec : "";
        kubunList.push({
          kubunName,
          name: item.label,
          tensuu: item.ten,
          count: item.count,
        })
      });
    }
  })
  return {
    patientId: patient.patientId.toString(),
    patientName: `${patient.lastName} ${patient.firstName}`,
    kubunList: kubunList,
    visitedAt: visit.visitedAt.substring(0, 10),
    clinicAddress: clinicInfo.address,
    clinicName: clinicInfo.name,
  }
}