import type { Kubun, ShinryoumeisaishoData } from "@/lib/drawer/forms/shinryoumeisaisho/shinryoumeisaisho-data";
import type { ClinicInfo, VisitEx } from "myclinic-model";

export function createShinryoumeisaishoData(visit: VisitEx, clinicInfo: ClinicInfo): ShinryoumeisaishoData {
  const patient = visit.patient;
  const kubunList: Kubun[] = [];
  return {
    patientId: patient.patientId.toString(),
    patientName: `${patient.lastName} ${patient.firstName}`,
    kubunList: kubunList,
    visitedAt: visit.visitedAt.substring(0, 10),
    clinicAddress: clinicInfo.address,
    clinicName: clinicInfo.name,
  }
}