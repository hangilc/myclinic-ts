import api from "@/lib/api";
import type { DiseaseEnterData, Patient, VisitEx } from "myclinic-model";
import type { DiseaseData, DiseaseExample } from "myclinic-model/model";
import type { Mode } from "./mode";
import { hasMatchingDrugDisease, type DrugDisease } from "@/lib/drug-disease";
import { cache } from "@/lib/cache";
import { extractDrugNames } from "./drugs-visit";
import { hasMatchingShinryouDiseases, type ShinryouDisease, type Fix as ShinryouFix } from "@/lib/shinryou-disease";
import { enterDiseaseByNames } from "./enter-disease-by-names";

let drugsWithoutMatchingDiseaseIndex = 1;
let shinryouWithoutMatchingDiseaseIndex = 1;

export class DiseaseEnv {
  patient: Patient;
  currentList: DiseaseData[] = [];
  allList: DiseaseData[] | undefined = undefined;
  editTarget: DiseaseData | undefined = undefined;
  checkingVisits: VisitEx[] = [];
  checkingDate: string | undefined;
  mode: Mode = "current";
  drugsWithoutMatchingDisease: {
    id: number;
    name: string;
    fixes: {
      pre: string[];
      name: string;
      post: string[];
    }[];
  }[] = [];
  shinryouWithoutMatchingDisease: {
    id: number;
    name: string;
    fixes: ShinryouFix[];
  }[] = [];

  constructor(
    patient: Patient
  ) {
    this.patient = patient;
  }

  async updateCurrentList() {
    this.currentList = await api.listCurrentDiseaseEx(this.patient.patientId);
  }

  async fetchAllList() {
    this.allList = await api.listDiseaseEx(this.patient.patientId);
  }

  clearAllList() {
    this.allList = undefined;
  }

  async updateAllList() {
    if (this.allList !== undefined) {
      await this.fetchAllList();
    }
  }


  async checkDrugs() {
    this.drugsWithoutMatchingDisease = [];
    const texts = this.checkingVisits.flatMap((visit) => visit.texts) ?? [];
    const drugNames: string[] = extractDrugNames(texts);
    const diseaseNames: string[] =
      this.currentList.filter(hasNoSusp).map((disease) => {
        return disease.byoumeiMaster.name;
      });
    for (let drugName of drugNames) {
      const m = hasMatchingDrugDisease(drugName, diseaseNames, await cache.getDrugDiseases());
      if (m === true) {
        continue;
      } else {
        this.drugsWithoutMatchingDisease.push({
          id: drugsWithoutMatchingDiseaseIndex++,
          name: drugName,
          fixes: m,
        });
      }
    }
  }

  async checkShinryou() {
    this.shinryouWithoutMatchingDisease = [];
    if (this.checkingDate) {
      const diseaseNames: string[] =
        this.currentList.map((disease) => {
          return disease.byoumeiMaster.name;
        }) ?? [];
      const shinryouMap: Record<
        string,
        {
          fixes: {
            label: string;
            exec: () => Promise<void>;
          }[];
        }
      > = {};
      this.checkingVisits.forEach((visit) => {
        visit.shinryouList.forEach((shinryou) => {
          const shinryouName = shinryou.master.name;
          shinryouMap[shinryouName] = { fixes: [] };
        });
      });
      const shinryouNames = Object.keys(shinryouMap);
      const shinryouDiseases: ShinryouDisease[] =
        await cache.getShinryouDiseases();
      const ctx = this.createShinryouContext(
        this.patient.patientId ?? 0,
        this.checkingDate,
      );
      for (let shinryouName of shinryouNames) {
        const m = hasMatchingShinryouDiseases(
          shinryouName,
          diseaseNames,
          shinryouDiseases,
          ctx
        );
        if (m === true) {
          // nop;
        } else {
          const fixes = m;
          this.shinryouWithoutMatchingDisease.push({
            id: shinryouWithoutMatchingDiseaseIndex++,
            name: shinryouName,
            fixes,
          });
        }
      }
    }
  }

  createShinryouContext(
    patientId: number,
    at: string
  ): {
    enterDisease: (diseaseName: string, adjNames: string[]) => Promise<void>;
  } {
    async function enterDisease(
      diseaseName: string,
      adjNames: string[]
    ): Promise<void> {
      const result = await enterDiseaseByNames(patientId, at, diseaseName, adjNames);
      if (typeof result === "string") {
        alert(result);
        throw new Error(result);
      }
    }
    return { enterDisease };
  }

  async changeModeTo(changingTo: Mode) {
    const prev = this.mode;
    if (prev === "edit" && changingTo !== "edit") {
      this.allList = [];
    }
    if (changingTo === "edit") {
      await this.fetchAllList();
    }
    this.mode = changingTo;
  }

  static async create(patient: Patient, checkingDate?: string): Promise<DiseaseEnv> {
    const env = new DiseaseEnv(patient);
    await env.updateCurrentList();
    const checkingVisits = await loadCheckingVisits(patient.patientId, checkingDate);
    if (checkingVisits) {
      env.checkingDate = checkingVisits.visitedAt;
      env.checkingVisits = checkingVisits.visits;
    } else {
      env.checkingDate = undefined;
      env.checkingVisits = [];
    }
    await env.checkDrugs();
    await env.checkShinryou();
    return env;
  }
}

async function loadCheckingVisits(patientId: number, checkingDate?: string):
  Promise<{ visitedAt: string, visits: VisitEx[] } | undefined> {
  function hasHoken(visit: VisitEx): boolean {
    return visit.hoken.shahokokuho != undefined || visit.hoken.koukikourei != undefined
  }
  async function loadVisitsAt(at: string): Promise<VisitEx[]> {
    const visitIds = await api.listVisitIdByDateIntervalAndPatient(at, at, patientId);
    let visits = await Promise.all(visitIds.map(visitId => api.getVisitEx(visitId)));
    visits = visits.filter(hasHoken);
    return visits;
  }
  async function loadRecentVisits(n: number): Promise<VisitEx[]> {
    const visitIds = await api.listVisitIdByPatientReverse(patientId, 0, n);
    let visits = await Promise.all(visitIds.map(visitId => api.getVisitEx(visitId)));
    return visits;
  }
  if (checkingDate) {
    let visits = await loadVisitsAt(checkingDate);
    if (visits.length > 0) {
      return {
        visitedAt: checkingDate,
        visits,
      }
    } else {
      return undefined;
    }
  } else {
    let visits = await loadRecentVisits(6);
    if (visits.length === 0) {
      return undefined;
    } else {
      const first = visits[0];
      const visitedAt = first.visitedAt.substring(0, 10);
      let vs: VisitEx[] = [first];
      for (let i = 1; i < visits.length; i++) {
        const v = visits[i];
        const at = v.visitedAt.substring(0, 10);
        if (visitedAt === at) {
          vs.push(v);
        } else {
          break;
        }
      }
      vs = vs.filter(hasHoken);
      if (vs.length > 0) {
        return {
          visitedAt,
          visits: vs
        }
      } else {
        return undefined;
      }
    }
  }
}

function hasNoSusp(disease: DiseaseData): boolean {
  for (let adj of disease.adjList) {
    const [_, master] = adj;
    if (master.name === "の疑い") {
      return false;
    }
  }
  return true;
}
