import type { Kubun, ShinryoumeisaishoData } from "@/lib/drawer/forms/shinryoumeisaisho/shinryoumeisaisho-data";
import type { ClinicInfo, ShinryouEx, VisitEx } from "myclinic-model";

export function createShinryoumeisaishoData(visit: VisitEx, clinicInfo: ClinicInfo): ShinryoumeisaishoData {
  const patient = visit.patient;
  const kubunList: Kubun[] = [];
  const keysaGroupMap: Map<string, ShinryouEx[]> = new Map();
  visit.shinryouList.forEach(shinryou => {
    console.log("shinryou", shinryou);
  });
  visit.conducts.forEach(conduct => {
    console.log("conduct", conduct);
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