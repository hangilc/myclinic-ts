import {
  ByoumeiMaster,
  Patient,
  PatientWrapper,
  type VisitEx,
} from "myclinic-model";
import type { CheckErrorWithFixers, Fixer } from "../check";
import api from "@/lib/api";

const allowedMainDiseases = [
  "糖尿病",
  "高血圧症",
  "高脂血症",
  "高コレステロール血症",
];

export async function checkMainDisease(
  visits: VisitEx[]
): Promise<CheckErrorWithFixers[]> {
  const checkErrors: CheckErrorWithFixers[] = [];
  for (let visit of visits) {
    let has生活習慣病管理料 = false;
    for (let shinryou of visit.shinryouList) {
      const m = shinryou.master;
      if (m.name.startsWith("生活習慣病管理料")) {
        has生活習慣病管理料 = true;
        break;
      }
    }
    if (has生活習慣病管理料) {
      const patient = new PatientWrapper(visit.patient);
      const at = visit.visitedAt.substring(0, 10);
      const diseases = await api.listDiseaseActiveAt(
        patient.patient.patientId,
        at,
        at
      );
      const masters = (
        await Promise.all(diseases.map((d) => api.getDiseaseEx(d.diseaseId)))
      ).map((d) => d.byoumeiMaster);
      const mainDisease = patient.getMainDisease();
      if (mainDisease) {
        if (!containsAllowed(mainDisease)) {
          checkErrors.push({
            code: `生活習慣病管理料の主病名が不適切: ${mainDisease}`,
            fixers: await fixers(visit.patient, masters),
          });
        }
      } else {
        checkErrors.push({
          code: `生活習慣病管理料の主病名が設定されていません`,
          fixers: await fixers(visit.patient, masters),
        });
      }
    }
  }
  return checkErrors;
}

async function fixers(
  patient: Patient,
  masters: ByoumeiMaster[]
): Promise<Fixer[]> {
  const mainDiseases = mainDiseaseCandidates(masters);
  return mainDiseases.map((mainDisease) => ({
    fix: async () => {
      const wrapper = new PatientWrapper(patient);
      wrapper.setMainDisease(mainDisease);
      await api.updatePatient(wrapper.patient);
      return true;
    },
    hint: `'${mainDisease}'を主病名とする`,
  }));
}

function containsAllowed(name: string): boolean {
  for (let allowed of allowedMainDiseases) {
    if (name.indexOf(allowed) >= 0) {
      return true;
    }
  }
  return false;
}

function mainDiseaseCandidates(ms: ByoumeiMaster[]): string[] {
  return ms.map((m) => m.name).filter((name) => containsAllowed(name));
}
