import { ByoumeiMaster, Patient, PatientWrapper, type VisitEx } from "myclinic-model";
import type { CheckError, Fixer } from "./check";
import api from "@/lib/api";

const allowedMainDiseases = ["糖尿病", "高血圧症", "高脂血症", "高コレステロール血症"];

export async function checkMainDisease(visit: VisitEx): Promise<CheckError | undefined> {
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
    const diseases = await api.listDiseaseActiveAt(patient.patient.patientId, at, at);
    const masters = (await Promise.all(diseases.map(d => api.getDiseaseEx(d.diseaseId)))).map(d => d.byoumeiMaster);
    const mainDisease = patient.getMainDisease();
    if (mainDisease) {
      if (!containsAllowed(mainDisease)) {
        return {
          code: `生活習慣病管理料の主病名が不適切: ${mainDisease}`,
          ...await fixer(visit.patient, masters),
        }
      }
    } else {
      const m = masters[0];
      if (!containsAllowed(m.name)) {
        return {
          code: `生活習慣病管理料の主病名が設定されていません`,
          ...await fixer(visit.patient, masters),
        };
      }
    }
  } else {
    return undefined;
  }
}

async function fixer(patient: Patient, masters: ByoumeiMaster[]): Promise<{ fix?: Fixer, hint?: string }> {
  const mainDisease = mainDiseaseCandidate(masters);
  if (mainDisease) {
    return {
      fix: async () => {
        const wrapper = new PatientWrapper(patient);
        wrapper.setMainDisease(mainDisease);
        await api.updatePatient(wrapper.patient);
        return true;
      },
      hint: `'${mainDisease}'を主病名とする`
    };
  } else { return {}; }
}

function containsAllowed(name: string): boolean {
  for (let allowed of allowedMainDiseases) {
    if (name.indexOf(allowed) >= 0) {
      return true;
    }
  }
  return false;
}

function mainDiseaseCandidate(ms: ByoumeiMaster[]): string | undefined {
  for (let m of ms) {
    const name = m.name;
    if (containsAllowed(name)) {
      return name;
    }
  }
  return undefined;
}
