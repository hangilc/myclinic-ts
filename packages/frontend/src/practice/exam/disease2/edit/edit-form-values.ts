import type { Invalid } from "@/lib/validator";
import type {
  DiseaseData,
  ByoumeiMaster,
  DiseaseEndReasonType,
  ShuushokugoMaster,
} from "myclinic-model";

export interface EditFormValues {
  diseaseId: number;
  patientId: number;
  byoumeiMaster?: ByoumeiMaster;
  shuushokugoMasters: ShuushokugoMaster[];
  startDate: Date | null;
  endDate: Date | null;
  endReason: DiseaseEndReasonType;
}

export function composeEditFormValues(data: DiseaseData) {
  return {
    diseaseId: data.disease.diseaseId,
    patientId: data.disease.patientId,
    byoumeiMaster: data.byoumeiMaster,
    shuushokugoMasters: data.adjList.map((a) => a[1]),
    startDate: data.disease.startDateAsDate,
    endDate: data.disease.endDateAsDate,
    endReason: data.endReason,
  };
}
